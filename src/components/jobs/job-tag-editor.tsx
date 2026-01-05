"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface JobTagEditorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

/**
 * JobTagEditor Component
 *
 * タグ編集エリア
 * - 新規タグ追加
 * - 既存タグ削除
 * - 推奨タグのサジェスチョン表示
 */
export function JobTagEditor({
  value,
  onChange,
  suggestions = [
    "高予算",
    "短期",
    "長期",
    "リピートクライアント",
    "高難易度",
    "新しいスキル",
    "得意分野",
  ],
}: JobTagEditorProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  // フィルタリングされたサジェスチョン
  const filteredSuggestions = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* タグ表示 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-2">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* タグ入力 */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="新しいタグを入力..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleAddTag(inputValue)}
            disabled={!inputValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* サジェスチョンドロップダウン */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleAddTag(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ヘルプテキスト */}
      <p className="text-xs text-gray-600">
        タグはEnterキーまたはプラスボタンで追加できます。
        既存タグをクリックするとクイック追加できます。
      </p>
    </div>
  );
}
