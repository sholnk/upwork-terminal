import fs from "fs";
import path from "path";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

export const metadata = {
    title: "操作マニュアル | UpWork Terminal",
};

export default async function ManualPage() {
    const filePath = path.join(process.cwd(), "docs", "manual.md");
    let content = "";

    try {
        content = fs.readFileSync(filePath, "utf-8");
    } catch (error) {
        console.error("Manual file not found:", error);
        content = "# Error\nManual file not found.";
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <article className="prose prose-slate max-w-none 
                prose-headings:font-bold prose-headings:text-gray-900 
                prose-h1:text-4xl prose-h1:mb-8 prose-h1:border-b prose-h1:pb-6 prose-h1:text-green-700
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-l-4 prose-h2:border-green-500 prose-h2:pl-4 prose-h2:bg-green-50 prose-h2:py-2
                prose-h3:text-xl prose-h3:mt-8 prose-h3:font-semibold prose-h3:text-gray-800
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                prose-ul:my-6 prose-li:my-2 prose-li:text-gray-600
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-img:rounded-lg prose-img:shadow-md prose-img:border prose-img:border-gray-200 prose-img:my-8
                prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-500
            ">
                <ReactMarkdown
                    components={{
                        img: ({ ...props }) => (
                            <div className="my-10">
                                <Image
                                    {...props}
                                    width={800}
                                    height={600}
                                    className="rounded-lg shadow-lg border border-gray-200 w-full max-w-4xl mx-auto"
                                    alt={props.alt || "Image"}
                                />
                                {props.alt && (
                                    <p className="text-center text-sm text-gray-500 mt-3 italic">
                                        ▲ {props.alt}
                                    </p>
                                )}
                            </div>
                        )
                    }}
                >
                    {content}
                </ReactMarkdown>
            </article>
        </div>
    );
}
