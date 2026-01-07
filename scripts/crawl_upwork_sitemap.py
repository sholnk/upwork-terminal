from playwright.sync_api import sync_playwright
import xml.etree.ElementTree as ET
from datetime import datetime

# 調査対象の主要サイトマップインデックス
SITEMAP_INDEXES = [
    "https://www.upwork.com/sitemaps/index.xml",
    "https://www.upwork.com/sitemaps/resource-center/index.xml",
    "https://support.upwork.com/sitemap.xml"
]

def fetch_with_browser(url):
    """Playwrightでページ取得"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            content = page.content()
            return content
        except Exception as e:
            print(f"  - エラー ({url}): {e}")
            return None
        finally:
            browser.close()

def get_urls_from_sitemap(url):
    urls = []
    try:
        content = fetch_with_browser(url)
        if not content:
            return []
        
        # HTMLラッパーを除去してXMLを抽出
        if "<sitemapindex" in content or "<urlset" in content:
            # XMLコンテンツを抽出
            start = content.find("<?xml")
            if start == -1:
                start = content.find("<sitemapindex")
            if start == -1:
                start = content.find("<urlset")
            if start != -1:
                content = content[start:]
                # 終了タグまで
                end = content.rfind("</sitemapindex>")
                if end == -1:
                    end = content.rfind("</urlset>")
                if end != -1:
                    content = content[:end + len("</sitemapindex>")]
        
        root = ET.fromstring(content)
        ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        # サブサイトマップ
        for sitemap in root.findall('.//ns:sitemap', ns):
            loc = sitemap.find('ns:loc', ns)
            if loc is not None:
                print(f"  - サブサイトマップを発見: {loc.text}")
                urls.extend(get_urls_from_sitemap(loc.text))
        
        # 実際のURL
        for url_tag in root.findall('.//ns:url', ns):
            loc = url_tag.find('ns:loc', ns)
            if loc is not None:
                urls.append(loc.text)
                
    except Exception as e:
        print(f"  - パースエラー ({url}): {e}")
    return urls

def main():
    all_urls = set()
    print(f"--- Upwork URL収集開始 (Playwright): {datetime.now()} ---")
    
    for index_url in SITEMAP_INDEXES:
        print(f"調査中: {index_url}")
        urls = get_urls_from_sitemap(index_url)
        all_urls.update(urls)
        print(f"完了: {len(urls)} 件のURLを取得")

    # Markdownファイルへの書き出し
    filename = "docs/upwork_full_map.md"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"# Upwork Complete URL Map\n")
        f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"Total Unique URLs: {len(all_urls)}\n\n---\n\n")
        
        # カテゴリ別に分類
        categories = {}
        for url in sorted(list(all_urls)):
            if "/hc/en-us/" in url:
                cat = "Help Center"
            elif "/developer/" in url:
                cat = "Developer"
            elif "/resources/" in url or "/resource-center/" in url:
                cat = "Resources"
            elif "/freelancers/" in url or "/hire/" in url:
                cat = "Marketplace"
            else:
                cat = "Other"
            
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(url)
        
        for cat, urls_list in sorted(categories.items()):
            f.write(f"## {cat} ({len(urls_list)} URLs)\n\n")
            for url in urls_list:
                f.write(f"* [{url}]({url})\n")
            f.write("\n")

    print(f"\n--- 成功! ---")
    print(f"合計 {len(all_urls)} 件のユニークURLを '{filename}' に保存しました。")

if __name__ == "__main__":
    main()
