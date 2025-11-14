import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/hooks/useTheme";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { Loader2, Plus, X } from "lucide-react";
import type { editor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import type { MCPConfig, MCPDetail } from "../mcp-service";

interface MCPFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (config: MCPConfig) => Promise<void>;
  isSubmitting?: boolean;
  initialData?: MCPDetail | null;
}

export function MCPFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialData = null,
}: MCPFormDialogProps) {
  const [activeTab, setActiveTab] = useState<"form" | "json">("form");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [serverName, setServerName] = useState("");
  const [transport, setTransport] = useState<"stdio" | "streamable_http">(
    "stdio"
  );
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState<string[]>([""]);
  const [url, setUrl] = useState("");
  const [env, setEnv] = useState<Array<{ key: string; value: string }>>([]);
  const [jsonValue, setJsonValue] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [argsError, setArgsError] = useState<string | null>(null);
  const isSyncingRef = useRef(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const { theme } = useTheme();

  // Default JSON template (only config part)
  const defaultJson = `{
  "server-name": {
    "transport": "stdio",
    "command": "npx",
    "args": [
      "-y",
      "server-name"
    ],
    "env": {
      "API_KEY": "your-api-key-here"
    }
  }
}`;

  // Get Monaco theme
  const getMonacoTheme = () => {
    if (theme === "light") {
      return "vs";
    } else if (theme === "dark") {
      return "vs-dark";
    }
    if (typeof document !== "undefined") {
      const isDarkClass = document.documentElement.classList.contains("dark");
      return isDarkClass ? "vs-dark" : "vs";
    }
    return "vs-dark";
  };

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Load initial data for edit mode
        isSyncingRef.current = true;
        setName(initialData.name || "");
        setDescription(initialData.description || "");
        const configJson = JSON.stringify(initialData.config, null, 2);
        setJsonValue(configJson);

        // Load form data from initialData.config
        // initialData.config is already in the format { "server-name": { ... } }
        if (configToForm(initialData.config)) {
          // Form data loaded successfully
        }
        isSyncingRef.current = false;
      } else {
        // Reset form for create mode
        setName("");
        setDescription("");
        setServerName("");
        setTransport("stdio");
        setCommand("");
        setArgs([""]);
        setUrl("");
        setEnv([]);
        setJsonValue(defaultJson);
        setJsonError(null);
        setNameError(null);
        setDisplayNameError(null);
        setCommandError(null);
        setUrlError(null);
        setArgsError(null);
        setActiveTab("form");

        // Extract server name from default JSON
        try {
          const parsed = JSON.parse(defaultJson);
          const keys = Object.keys(parsed);
          if (keys.length > 0) {
            setServerName(keys[0]);
          }
        } catch {
          // Ignore
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  // Validate display name
  const validateDisplayName = (name: string): string | null => {
    if (!name.trim()) {
      return "Name is required";
    }
    return null;
  };

  // Validate server name: only lowercase letters, numbers, and hyphens
  const validateServerName = (name: string): string | null => {
    if (!name.trim()) {
      return "Server name is required";
    }
    if (!/^[a-z0-9-]+$/.test(name)) {
      return "Server name must contain only lowercase letters, numbers, and hyphens";
    }
    return null;
  };

  // Convert form data to config object
  const formToConfig = (): Record<string, any> => {
    const serverConfig: Record<string, any> = {
      transport,
    };

    if (transport === "stdio") {
      serverConfig.command = command;
      serverConfig.args = args.filter((arg) => arg.trim() !== "");
      if (env.length > 0) {
        serverConfig.env = env.reduce((acc, { key, value }) => {
          if (key.trim() && value.trim()) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {} as Record<string, string>);
      }
    } else if (transport === "streamable_http") {
      serverConfig.url = url;
      if (env.length > 0) {
        serverConfig.env = env.reduce((acc, { key, value }) => {
          if (key.trim() && value.trim()) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {} as Record<string, string>);
      }
    }

    return {
      [serverName || "server-name"]: serverConfig,
    };
  };

  // Convert config object to form data
  const configToForm = (config: Record<string, any>): boolean => {
    const keys = Object.keys(config);
    if (keys.length !== 1) {
      setJsonError("Config must contain exactly one server configuration");
      return false;
    }

    const name = keys[0];
    const nameValidation = validateServerName(name);
    if (nameValidation) {
      setJsonError(nameValidation);
      return false;
    }

    const serverConfig = config[name];

    if (
      typeof serverConfig !== "object" ||
      serverConfig === null ||
      Array.isArray(serverConfig)
    ) {
      setJsonError("Server configuration must be a JSON object");
      return false;
    }

    // Validate transport
    const transportValue = serverConfig.transport;
    if (
      !transportValue ||
      (transportValue !== "stdio" && transportValue !== "streamable_http")
    ) {
      setJsonError("Transport must be either 'stdio' or 'streamable_http'");
      return false;
    }

    isSyncingRef.current = true;
    setServerName(name);
    setTransport(transportValue);

    if (transportValue === "stdio") {
      setCommand(serverConfig.command || "");
      setArgs(
        serverConfig.args &&
          Array.isArray(serverConfig.args) &&
          serverConfig.args.length > 0
          ? serverConfig.args
          : [""]
      );
      setUrl("");
      setEnv(
        serverConfig.env
          ? Object.entries(serverConfig.env).map(([key, value]) => ({
              key,
              value: String(value),
            }))
          : []
      );
    } else if (transportValue === "streamable_http") {
      setUrl(serverConfig.url || "");
      setCommand("");
      setArgs([""]);
      setEnv(
        serverConfig.env
          ? Object.entries(serverConfig.env).map(([key, value]) => ({
              key,
              value: String(value),
            }))
          : []
      );
    }

    setJsonError(null);
    isSyncingRef.current = false;
    return true;
  };

  // Sync form to JSON when form changes
  useEffect(() => {
    if (!isSyncingRef.current && activeTab === "json") {
      const config = formToConfig();
      const formatted = JSON.stringify(config, null, 2);
      setJsonValue(formatted);
      if (jsonError) {
        setJsonError(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverName, transport, command, args, url, env, activeTab]);

  // Handle server name change
  const handleServerNameChange = (value: string) => {
    // Convert to lowercase and filter invalid characters
    const filtered = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setServerName(filtered);
    const error = validateServerName(filtered);
    setNameError(error);
  };

  // Handle command change
  const handleCommandChange = (value: string) => {
    setCommand(value);
    if (transport === "stdio") {
      setCommandError(value.trim() ? null : "Command is required");
    }
  };

  // Handle URL change
  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (transport === "streamable_http") {
      setUrlError(value.trim() ? null : "URL is required");
    }
  };

  // Handle args change
  const handleArgsChange = (index: number, value: string) => {
    updateArg(index, value);
    if (transport === "stdio") {
      const hasValidArg = args.some((arg, i) =>
        i !== index ? arg.trim() : value.trim()
      );
      setArgsError(hasValidArg ? null : "At least one argument is required");
    }
  };

  // Handle JSON change (only config part)
  const handleJsonChange = (value: string | undefined) => {
    const jsonStr = value || "";
    setJsonValue(jsonStr);
    if (jsonStr.trim()) {
      try {
        const parsed = JSON.parse(jsonStr);
        // Only parse config part, not name/description
        configToForm(parsed);
      } catch (error) {
        setJsonError(
          error instanceof Error ? error.message : "Invalid JSON format"
        );
      }
    } else {
      setJsonError(null);
    }
  };

  // Handle editor mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Format JSON in editor
  const formatJson = () => {
    if (!editorRef.current || !monacoRef.current) return;

    try {
      const parsed = JSON.parse(jsonValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonValue(formatted);
      editorRef.current.setValue(formatted);
    } catch {
      setJsonError("Cannot format invalid JSON");
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "form" | "json");
    if (value === "json") {
      // Sync form to JSON
      const config = formToConfig();
      const formatted = JSON.stringify(config, null, 2);
      setJsonValue(formatted);
      setJsonError(null);
    }
  };

  // Validate form before submit
  const validateForm = (): string | null => {
    const displayNameErr = validateDisplayName(name);
    setDisplayNameError(displayNameErr);
    if (displayNameErr) {
      return displayNameErr;
    }

    const nameErr = validateServerName(serverName);
    setNameError(nameErr);
    if (nameErr) {
      return nameErr;
    }

    if (!transport) {
      return "Transport is required";
    }

    if (transport === "stdio") {
      const cmdErr = !command.trim() ? "Command is required" : null;
      setCommandError(cmdErr);
      if (cmdErr) {
        return cmdErr;
      }
      const argsErr =
        !args || args.length === 0 || args.every((arg) => !arg.trim())
          ? "At least one argument is required"
          : null;
      setArgsError(argsErr);
      if (argsErr) {
        return argsErr;
      }
    } else if (transport === "streamable_http") {
      const urlErr = !url.trim() ? "URL is required" : null;
      setUrlError(urlErr);
      if (urlErr) {
        return urlErr;
      }
    }

    return null;
  };

  // Validate JSON before submit (only config part)
  const validateJson = (): string | null => {
    if (!jsonValue.trim()) {
      return "Config JSON cannot be empty";
    }

    try {
      const parsed = JSON.parse(jsonValue);
      const keys = Object.keys(parsed);

      if (keys.length !== 1) {
        return "Config must contain exactly one server configuration";
      }

      const serverName = keys[0];
      const nameValidation = validateServerName(serverName);
      if (nameValidation) {
        return nameValidation;
      }

      const serverConfig = parsed[serverName];

      if (
        typeof serverConfig !== "object" ||
        serverConfig === null ||
        Array.isArray(serverConfig)
      ) {
        return "Server configuration must be a JSON object";
      }

      if (!serverConfig.transport) {
        return "Transport is required";
      }

      if (
        serverConfig.transport !== "stdio" &&
        serverConfig.transport !== "streamable_http"
      ) {
        return "Transport must be either 'stdio' or 'streamable_http'";
      }

      if (serverConfig.transport === "stdio") {
        if (!serverConfig.command) {
          return "Command is required when transport is 'stdio'";
        }
        if (
          !serverConfig.args ||
          !Array.isArray(serverConfig.args) ||
          serverConfig.args.length === 0
        ) {
          return "At least one argument is required when transport is 'stdio'";
        }
      } else if (serverConfig.transport === "streamable_http") {
        if (!serverConfig.url) {
          return "URL is required when transport is 'streamable_http'";
        }
      }

      return null;
    } catch {
      return "Invalid JSON format";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate display name
    const displayNameErr = validateDisplayName(name);
    setDisplayNameError(displayNameErr);
    if (displayNameErr) {
      return;
    }

    let config: Record<string, any>;

    if (activeTab === "form") {
      const error = validateForm();
      if (error) {
        setJsonError(error);
        return;
      }
      config = formToConfig();
    } else {
      const error = validateJson();
      if (error) {
        setJsonError(error);
        return;
      }
      try {
        config = JSON.parse(jsonValue);
      } catch {
        setJsonError("Invalid JSON format");
        return;
      }
    }

    const mcpConfig: MCPConfig = {
      name,
      description: description.trim() || undefined,
      config,
    };

    await onSubmit(mcpConfig);
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setServerName("");
    setTransport("stdio");
    setCommand("");
    setArgs([""]);
    setUrl("");
    setEnv([]);
    setJsonValue(defaultJson);
    setJsonError(null);
    setNameError(null);
    setDisplayNameError(null);
    setCommandError(null);
    setUrlError(null);
    setArgsError(null);
    setActiveTab("form");
  };

  const handleClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      handleReset();
    }
    onOpenChange(open);
  };

  const addArg = () => {
    setArgs([...args, ""]);
  };

  const removeArg = (index: number) => {
    setArgs(args.filter((_, i) => i !== index));
  };

  const updateArg = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index] = value;
    setArgs(newArgs);
  };

  const addEnv = () => {
    setEnv([...env, { key: "", value: "" }]);
  };

  const removeEnv = (index: number) => {
    setEnv(env.filter((_, i) => i !== index));
  };

  const updateEnv = (index: number, field: "key" | "value", value: string) => {
    const newEnv = [...env];
    newEnv[index] = { ...newEnv[index], [field]: value };
    setEnv(newEnv);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData
              ? "Edit MCP Configuration"
              : "Create MCP Configuration"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the Model Context Protocol (MCP) server configuration"
              : "Configure a new Model Context Protocol (MCP) server connection"}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name and Description Section */}
              <div className="space-y-4 pb-4 border-b">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name">Name *</Label>
                  <Input
                    id="display-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="MCP Configuration Name"
                    required
                    className={
                      displayNameError
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  {displayNameError ? (
                    <p className="text-xs text-destructive">
                      {displayNameError}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Display name for this MCP configuration
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description of this MCP configuration"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional description for this MCP configuration
                  </p>
                </div>
              </div>

              {/* Config Section */}
              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="server-name">Server Name *</Label>
                  <Input
                    id="server-name"
                    value={serverName}
                    onChange={(e) => handleServerNameChange(e.target.value)}
                    placeholder="Server Name"
                    required
                    className={
                      nameError
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  {nameError ? (
                    <p className="text-xs text-destructive">{nameError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Only lowercase letters, numbers, and hyphens are allowed
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transport">Transport *</Label>
                  <Select
                    value={transport}
                    onValueChange={(value: "stdio" | "streamable_http") =>
                      setTransport(value)
                    }
                  >
                    <SelectTrigger id="transport">
                      <SelectValue placeholder="Select transport type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stdio">stdio</SelectItem>
                      <SelectItem value="streamable_http">
                        streamable_http
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {transport === "stdio" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="command">Command *</Label>
                      <Input
                        id="command"
                        value={command}
                        onChange={(e) => handleCommandChange(e.target.value)}
                        placeholder="e.g., npx"
                        required
                        className={
                          commandError
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                      />
                      {commandError && (
                        <p className="text-xs text-destructive">
                          {commandError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label>Arguments *</Label>
                      <div className="space-y-2">
                        {args.map((arg, index) => (
                          <div key={index} className="flex gap-2">
                            <div className="flex-1 space-y-1.5">
                              <Input
                                value={arg}
                                onChange={(e) =>
                                  handleArgsChange(index, e.target.value)
                                }
                                placeholder={`Argument ${index + 1}`}
                                required={index === 0}
                                className={
                                  argsError && index === 0
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }
                              />
                              {argsError && index === 0 && (
                                <p className="text-xs text-destructive">
                                  {argsError}
                                </p>
                              )}
                            </div>
                            {args.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeArg(index)}
                                className="mt-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addArg}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Argument
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Environment Variables (Optional)</Label>
                      <div className="space-y-2">
                        {env.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={item.key}
                              onChange={(e) =>
                                updateEnv(index, "key", e.target.value)
                              }
                              placeholder="Key"
                            />
                            <Input
                              value={item.value}
                              onChange={(e) =>
                                updateEnv(index, "value", e.target.value)
                              }
                              placeholder="Value"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeEnv(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addEnv}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Environment Variable
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {transport === "streamable_http" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="url">URL *</Label>
                      <Input
                        id="url"
                        type="url"
                        value={url}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="e.g., https://mcp.example.com"
                        required
                        className={
                          urlError
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                      />
                      {urlError && (
                        <p className="text-xs text-destructive">{urlError}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Environment Variables (Optional)</Label>
                      <div className="space-y-2">
                        {env.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={item.key}
                              onChange={(e) =>
                                updateEnv(index, "key", e.target.value)
                              }
                              placeholder="Key"
                            />
                            <Input
                              value={item.value}
                              onChange={(e) =>
                                updateEnv(index, "value", e.target.value)
                              }
                              placeholder="Value"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeEnv(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addEnv}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Environment Variable
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </form>
          </TabsContent>

          <TabsContent value="json" className="space-y-4 mt-4">
            {/* Name and Description Section */}
            <div className="space-y-4 pb-4 border-b">
              <div className="space-y-1.5">
                <Label htmlFor="display-name-json">Name *</Label>
                <Input
                  id="display-name-json"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="MCP Configuration Name"
                  required
                  className={
                    displayNameError
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {displayNameError ? (
                  <p className="text-xs text-destructive">{displayNameError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Display name for this MCP configuration
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description-json">Description</Label>
                <Textarea
                  id="description-json"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description of this MCP configuration"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Optional description for this MCP configuration
                </p>
              </div>
            </div>

            {/* Config Section */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="config-json">Configuration JSON *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={formatJson}
                >
                  Format JSON
                </Button>
              </div>
              <div
                className="border rounded-md overflow-hidden"
                style={{ height: "500px" }}
              >
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  value={jsonValue}
                  onChange={handleJsonChange}
                  onMount={handleEditorDidMount}
                  theme={getMonacoTheme()}
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
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </div>
              {jsonError ? (
                <p className="text-xs text-destructive">{jsonError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  MCP server configuration in JSON format. The key is the server
                  name (lowercase letters, numbers, and hyphens only).
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !!jsonError ||
              !!displayNameError ||
              !!nameError ||
              !!commandError ||
              !!urlError ||
              !!argsError
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
