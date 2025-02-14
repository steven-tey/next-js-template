"use client";

import { useState } from "react";
import { diffChars } from "diff";

import titlesForBlogPost from "../imaginary-functions/titlesForBlogPost";
import tagsForBlogPost from "../imaginary-functions/tagsForBlogPost";
import addParagraphToBlogPost from "../imaginary-functions/addParagraphToBlogPost";
import addConcludingParagraphToBlogPost from "../imaginary-functions/addConcludingParagraphToBlogPost";

export default function Home() {
  const [blogTitle, setBlogTitle] = useState("");
  const [blogText, setBlogText] = useState<string>("");
  const [textWhenTitleWasAsked, setTextWhentTitleWasAsked] =
    useState<string>("");
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [addParagraphLoading, setAddParagraphLoading] = useState(false);
  const [addConclusionLoading, setAddConclusionLoading] = useState(false);

  const changeBlogText = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;

    setBlogText(e.target.value);

    if (diffCharCount(newText, textWhenTitleWasAsked) > 100) {
      refreshSuggestions(newText);
    }
  };

  const addTag = (tag: string) => {
    if (tags.includes(tag)) return;

    setTags([...tags, tag]);
  };

  const refreshSuggestions = (newText: string) => {
    setTextWhentTitleWasAsked(newText);

    // don't call await, because we want these to happen in parallel.
    suggestTitles(newText);
    suggestTags(newText);
  };

  const suggestTitles = async (text: string) => {
    setSuggestedTitles(await titlesForBlogPost(text));
  };

  const suggestTags = async (text: string) => {
    setSuggestedTags(await tagsForBlogPost(text));
  };

  const addParagraph = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setAddParagraphLoading(true);
    const newText =
      blogText + "\n\n" + (await addParagraphToBlogPost(blogText));
    setBlogText(newText);
    setAddParagraphLoading(false);
    refreshSuggestions(newText);
  };

  const addConclusion = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setAddConclusionLoading(true);
    const newText =
      blogText + "\n\n" + (await addConcludingParagraphToBlogPost(blogText));
    setBlogText(newText);
    setAddConclusionLoading(false);
    refreshSuggestions(newText);
  };

  return (
    <main className="flex m-5 flex-col">
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-6xl">
          <h1 className="text-2xl font-bold mb-5">Create a Blog Post</h1>
          <form action="#" method="POST">
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-gray-700 font-semibold mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
              />
            </div>
            <div className="text-s mb-3">
              Suggested titles:{" "}
              {suggestedTitles.length ? (
                <TitleList
                  onSelectTitle={setBlogTitle}
                  titles={suggestedTitles}
                />
              ) : (
                <div className="text-sm italic">
                  type some content for suggestions
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="content"
                className="block text-gray-700 font-semibold mb-2"
              >
                Content
              </label>
              <textarea
                id="content"
                name="content"
                rows={5}
                className="w-full h-[35rem] p-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                onChange={changeBlogText}
                value={blogText}
              ></textarea>
            </div>
            <div className="flex justify-end">
              <Button onClick={addParagraph} isLoading={addParagraphLoading}>
                Add Paragraph
              </Button>
              <Button onClick={addConclusion} isLoading={addConclusionLoading}>
                Add Conclusion
              </Button>
            </div>{" "}
            <div className="mb-4">
              <label
                htmlFor="tags"
                className="block text-gray-700 font-semibold mb-2"
              >
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                placeholder="tag1, tag2, tag3..."
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                onChange={(e) => setTags(e.target.value.split(", "))}
                value={tags.join(", ")}
              />
            </div>
            <div className="text-s mb-3">
              Suggested tags:{" "}
              {suggestedTags.length ? (
                <TagList tags={suggestedTags} onSelectTag={addTag} />
              ) : (
                <div className="text-sm italic">
                  type some content for suggestions
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold p-3 rounded hover:bg-indigo-700 focus:outline-none"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Loading({ visible }: { visible: boolean }) {
  return (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      {visible && (
        <>
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </>
      )}
    </svg>
  );
}

function TitleList({
  titles,
  onSelectTitle,
}: {
  titles: string[];
  onSelectTitle: (arg: string) => void;
}) {
  return (
    <>
      {titles.map((title) => (
        <div key={title}>
          <a
            className="text-sm underline decoration-indigo-500 cursor-pointer"
            onClick={(e) => onSelectTitle(title)}
          >
            {title}
          </a>
        </div>
      ))}
    </>
  );
}

function TagList({
  tags,
  onSelectTag,
}: {
  tags: string[];
  onSelectTag: (arg: string) => void;
}) {
  return (
    <>
      {tags.map((tag) => (
        <div
          key={tag}
          className="inline-block rounded-lg bg-indigo-700 mx-2 my-1 text-white px-3 py-1"
        >
          <a
            className="text-sm cursor-pointer"
            onClick={(e) => onSelectTag(tag)}
          >
            {tag}
          </a>
        </div>
      ))}
    </>
  );
}

function Button({
  onClick,
  isLoading,
  children,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  isLoading: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-indigo-600 text-white text-sm font-semibold py-3 pr-8 pl-3 mx-2 rounded hover:bg-indigo-700 focus:outline-none"
    >
      <Loading visible={isLoading} />
      {children}
    </button>
  );
}

function diffCharCount(str1: string, str2: string) {
  const fullCharDiff = diffChars(str1, str2);

  return fullCharDiff
    .filter(({ added, removed }) => added || removed)
    .reduce((total, { value }) => (total += value.length), 0);
}
