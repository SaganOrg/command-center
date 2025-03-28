// "use client";
// import React, { useState } from "react";
// import RichTextEditor from "./RichTextEditor";

// // Utility function to strip HTML tags and get plain text
// const stripHtml = (html) => {
//   const tempDiv = document.createElement("div");
//   tempDiv.innerHTML = html;
//   return tempDiv.textContent || tempDiv.innerText || "";
// };

// export default function PreviewExample() {
//   const [editorContent, setEditorContent] = useState("");
//   const [finalContent, setFinalContent] = useState("");

//   const handleContentChange = (html) => {
//     setEditorContent(html);
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Rich Text Editor with Preview</h1>
//       <RichTextEditor content={editorContent} onChange={handleContentChange} />
//       <button 
//         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         onClick={() => setFinalContent(editorContent)}
//       >
//         Submit
//       </button>
//       <div className="mt-6">
//         <h2 className="text-xl font-semibold mb-2">Submitted Result (formatted):</h2>
//         <div 
//           className="bg-gray-100 p-4 rounded-md border prose max-w-none mb-4"
//           dangerouslySetInnerHTML={{ __html: finalContent || "No content yet" }}
//         />
//         <h2 className="text-xl font-semibold mb-2">Plain Text Version:</h2>
//         <pre className="bg-gray-100 p-4 rounded-md border whitespace-pre-wrap">
//           {stripHtml(finalContent) || "No content yet"}
//         </pre>
//       </div>
//     </div>
//   );
// }