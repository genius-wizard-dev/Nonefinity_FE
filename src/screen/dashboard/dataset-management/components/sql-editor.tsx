"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { LogoSpinner } from "@/components/shared";
import { useState, useRef, useEffect } from "react";
import Editor, { type OnMount, type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useDatasetStore } from "../store";
import { useTheme } from "next-themes";

interface SqlEditorProps {
    onExecute: (query: string) => void;
    isExecuting: boolean;
    selectedTable?: string | null;
}

export function SqlEditor({ onExecute, isExecuting }: SqlEditorProps) {
    const [query, setQuery] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const { datasets, selectedDataset } = useDatasetStore();
    const { resolvedTheme } = useTheme();

    // Determine the Monaco theme - check multiple sources
    const getMonacoTheme = () => {
        console.log("resolvedTheme:", resolvedTheme);
        
        // First check resolvedTheme
        if (resolvedTheme === "light") {
            return "vs";
        } else if (resolvedTheme === "dark") {
            return "vs-dark";
        }
        
        // Fallback: check document class
        if (typeof document !== "undefined") {
            const isDarkClass = document.documentElement.classList.contains("dark");
            console.log("Document has dark class:", isDarkClass);
            return isDarkClass ? "vs-dark" : "vs";
        }
        
        // Default to dark
        return "vs-dark";
    };

    const monacoTheme = getMonacoTheme();

    // Update Monaco theme when resolvedTheme changes
    useEffect(() => {
        if (isMounted && monacoRef.current && editorRef.current) {
            const newTheme = getMonacoTheme();
            console.log("Changing Monaco theme to:", newTheme, "from resolvedTheme:", resolvedTheme);
            monacoRef.current.editor.setTheme(newTheme);
        }
    }, [resolvedTheme, isMounted]);
    
    // Also watch for class changes on document
    useEffect(() => {
        if (!isMounted || typeof document === "undefined") return;
        
        const observer = new MutationObserver(() => {
            if (monacoRef.current && editorRef.current) {
                const newTheme = getMonacoTheme();
                console.log("Document class changed, updating theme to:", newTheme);
                monacoRef.current.editor.setTheme(newTheme);
            }
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        
        return () => observer.disconnect();
    }, [isMounted]);

    const handleExecute = () => {
        if (query.trim() && !isExecuting) {
            onExecute(query);
        }
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Set initial theme using the same detection logic
        const initialTheme = getMonacoTheme();
        monaco.editor.setTheme(initialTheme);
        console.log("Editor mounted with theme:", initialTheme, "resolvedTheme:", resolvedTheme);
        
        setIsMounted(true);

        // Register SQL completion provider
        monaco.languages.registerCompletionItemProvider("sql", {
            provideCompletionItems: (_model, _position) => {
                const suggestions: any[] = [];

                // SQL Keywords
                const keywords = [
                    "SELECT",
                    "FROM",
                    "WHERE",
                    "ORDER BY",
                    "GROUP BY",
                    "HAVING",
                    "INSERT",
                    "UPDATE",
                    "DELETE",
                    "JOIN",
                    "INNER JOIN",
                    "LEFT JOIN",
                    "RIGHT JOIN",
                    "ON",
                    "AS",
                    "DISTINCT",
                    "LIMIT",
                    "OFFSET",
                    "COUNT",
                    "SUM",
                    "AVG",
                    "MIN",
                    "MAX",
                    "AND",
                    "OR",
                    "NOT",
                    "IN",
                    "BETWEEN",
                    "LIKE",
                    "IS NULL",
                    "IS NOT NULL",
                    "ASC",
                    "DESC",
                ];

                keywords.forEach((keyword) => {
                    suggestions.push({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        detail: "SQL Keyword",
                        sortText: "0" + keyword,
                    });
                });

                // Add selected dataset first with higher priority
                if (selectedDataset) {
                    suggestions.push({
                        label: selectedDataset.name,
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: selectedDataset.name,
                        detail: `✓ Selected Table (${
                            selectedDataset.rowCount || 0
                        } rows)`,
                        documentation:
                            selectedDataset.description ||
                            "Selected dataset table",
                        sortText: "1" + selectedDataset.name,
                    });

                    // Add columns from selected dataset with high priority
                    selectedDataset.data_schema.forEach((column) => {
                        suggestions.push({
                            label: column.column_name,
                            kind: monaco.languages.CompletionItemKind.Field,
                            insertText: column.column_name,
                            detail: `${column.column_type} - ${selectedDataset.name}`,
                            documentation:
                                column.desc ||
                                `Column from ${selectedDataset.name}`,
                            sortText: "2" + column.column_name,
                        });
                    });
                }

                // Add other dataset/table names
                datasets.forEach((dataset) => {
                    if (dataset.id !== selectedDataset?.id) {
                        suggestions.push({
                            label: dataset.name,
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: dataset.name,
                            detail: `Table (${dataset.rowCount || 0} rows)`,
                            documentation:
                                dataset.description || "Dataset table",
                            sortText: "3" + dataset.name,
                        });

                        // Add column names for each dataset
                        dataset.data_schema.forEach((column) => {
                            suggestions.push({
                                label: `${dataset.name}.${column.column_name}`,
                                kind: monaco.languages.CompletionItemKind.Field,
                                insertText: column.column_name,
                                detail: `${column.column_type} - ${dataset.name}`,
                                documentation:
                                    column.desc ||
                                    `Column from ${dataset.name}`,
                                sortText: "4" + column.column_name,
                            });
                        });
                    }
                });

                return { suggestions };
            },
        });

        // Add keyboard shortcut for executing query (Ctrl + Enter)
        editor.addAction({
            id: "execute-sql-query",
            label: "Execute SQL Query",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            contextMenuGroupId: "navigation",
            contextMenuOrder: 1.5,
            run: (ed) => {
                const currentQuery = ed.getValue();
                if (currentQuery.trim()) {
                    onExecute(currentQuery);
                }
            },
        });

        // Also add keybinding directly
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            const currentQuery = editor.getValue();
            if (currentQuery.trim()) {
                onExecute(currentQuery);
            }
        });

        // Focus the editor
        editor.focus();
    };

    return (
        <div className="bg-card flex flex-col h-[280px] border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0 bg-card/50">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium text-foreground">
                        SQL Editor
                    </h2>
                    <span className="text-xs text-muted-foreground">
                        {selectedDataset &&
                            `Dataset: ${selectedDataset.name} • `}
                        Press Ctrl+Enter to execute
                    </span>
                </div>
                <Button
                    onClick={handleExecute}
                    disabled={isExecuting || !query.trim()}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {isExecuting ? (
                        <>
                            <LogoSpinner size="sm" className="mr-2" />
                            Executing...
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4 mr-2" />
                            Execute Query
                        </>
                    )}
                </Button>
            </div>
            <div className="relative flex-1 min-h-0">
                <Editor
                    height="100%"
                    defaultLanguage="sql"
                    value={query}
                    onChange={(value) => setQuery(value || "")}
                    onMount={handleEditorDidMount}
                    theme={monacoTheme}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        roundedSelection: true,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: "on",
                        padding: { top: 10, bottom: 10 },
                        suggest: {
                            showKeywords: true,
                            showSnippets: true,
                            showWords: true,
                            showClasses: true,
                            showFields: true,
                        },
                        quickSuggestions: {
                            other: true,
                            comments: false,
                            strings: true,
                        },
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: "on",
                        tabCompletion: "on",
                        parameterHints: {
                            enabled: true,
                        },
                        formatOnPaste: true,
                        formatOnType: true,
                    }}
                />
            </div>
        </div>
    );
}
