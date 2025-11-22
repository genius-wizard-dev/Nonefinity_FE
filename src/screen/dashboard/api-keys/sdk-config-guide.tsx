import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy, Info, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface SDKConfigGuideProps {
    apiKey?: string;
    apiUrl?: string;
}

export function SDKConfigGuide({ apiKey, apiUrl }: SDKConfigGuideProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const apiUrlValue = apiUrl || "https://api.nonefinity.com/api/v1";
    const apiKeyValue = apiKey || "YOUR_API_KEY";

    const examples = {
        install: `npm install @nonefinity/ai-sdk
# or
yarn add @nonefinity/ai-sdk
# or
pnpm add @nonefinity/ai-sdk`,

        basicUsage: `import { NonefinityClient } from "@nonefinity/ai-sdk";

const client = new NonefinityClient({
  apiUrl: "${apiUrlValue}",
  apiKey: "${apiKeyValue}",
});

// Create a chat session
const session = await client.createSession({
  chat_config_id: "your-config-id",
  name: "Customer Chat"
});

// Stream a message
await client.streamMessage(
  session.data.id,
  "Hello!",
  (event) => {
    if (event.event === "ai_result") {
      console.log("AI:", event.data.content);
    }
  }
);`,

        react: `import { NonefinityClient } from "@nonefinity/ai-sdk";
import { useState, useEffect } from "react";

function ChatApp() {
  const [client] = useState(() => new NonefinityClient({
    apiUrl: "${apiUrlValue}",
    apiKey: "${apiKeyValue}",
  }));

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Initialize session
  useEffect(() => {
    async function init() {
      const configs = await client.listConfigs(0, 1);
      if (configs.success && configs.data.chat_configs.length > 0) {
        const session = await client.createSession({
          chat_config_id: configs.data.chat_configs[0].id,
          name: "Web Chat"
        });
        if (session.success) {
          setSessionId(session.data.id);
        }
      }
    }
    init();
  }, []);

  const sendMessage = async (message) => {
    if (!sessionId) return;

    setMessages(prev => [...prev, { type: "user", text: message }]);

    let aiResponse = "";
    await client.streamMessage(sessionId, message, (event) => {
      if (event.event === "ai_result") {
        aiResponse += event.data.content;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            type: "ai",
            text: aiResponse
          };
          return updated;
        });
      }
    });
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>{msg.text}</div>
      ))}
    </div>
  );
}`,

        vanillaJS: `<!DOCTYPE html>
<html>
<head>
  <title>AI Chat</title>
</head>
<body>
  <div id="chat"></div>

  <script type="module">
    import { NonefinityClient } from 'https://unpkg.com/@nonefinity/ai-sdk/dist/index.mjs';

    const client = new NonefinityClient({
      apiUrl: '${apiUrlValue}',
      apiKey: '${apiKeyValue}'
    });

    // Use the client
    const sessions = await client.listSessions();
    console.log(sessions);
  </script>
</body>
</html>`,

        env: `# .env
VITE_NONEFINITY_API_URL=${apiUrlValue}
VITE_NONEFINITY_API_KEY=${apiKeyValue}`,

        envUsage: `// Using environment variables
const client = new NonefinityClient({
  apiUrl: import.meta.env.VITE_NONEFINITY_API_URL,
  apiKey: import.meta.env.VITE_NONEFINITY_API_KEY,
});`,
    };

    const CodeBlock = ({ code, index }: { code: string; index: number }) => (
        <div className="relative">
            <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg overflow-auto text-sm leading-relaxed font-mono">
                <code>{code}</code>
            </pre>
            <Button
                onClick={() => handleCopy(code, index)}
                variant="outline"
                size="sm"
                className="absolute top-3 right-3"
            >
                <Copy className="h-4 w-4 mr-2" />
                {copiedIndex === index ? "Copied!" : "Copy"}
            </Button>
        </div>
    );

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>SDK Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Quick Start</AlertTitle>
                    <AlertDescription>
                        Follow these steps to integrate the Nonefinity AI SDK
                        into your application.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <h4 className="text-lg font-semibold">1. Installation</h4>
                    <CodeBlock code={examples.install} index={0} />
                </div>

                <div className="space-y-4">
                    <h4 className="text-lg font-semibold">2. Basic Usage</h4>
                    <Tabs defaultValue="1">
                        <TabsList>
                            <TabsTrigger value="1">
                                TypeScript/JavaScript
                            </TabsTrigger>
                            <TabsTrigger value="2">React</TabsTrigger>
                            <TabsTrigger value="3">Vanilla JS</TabsTrigger>
                        </TabsList>
                        <TabsContent value="1">
                            <CodeBlock code={examples.basicUsage} index={1} />
                        </TabsContent>
                        <TabsContent value="2">
                            <CodeBlock code={examples.react} index={2} />
                        </TabsContent>
                        <TabsContent value="3">
                            <CodeBlock code={examples.vanillaJS} index={3} />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-4">
                    <h4 className="text-lg font-semibold">
                        3. Environment Variables (Recommended)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        Store your API key securely using environment variables:
                    </p>
                    <CodeBlock code={examples.env} index={4} />
                    <div className="mt-3">
                        <p className="text-sm font-semibold mb-2">Usage:</p>
                        <CodeBlock code={examples.envUsage} index={5} />
                    </div>
                </div>

                <Alert variant="default">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Security Best Practices</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>Never commit API keys to version control</li>
                            <li>Use environment variables for API keys</li>
                            <li>Rotate keys regularly</li>
                            <li>
                                Use different keys for development and
                                production
                            </li>
                            <li>
                                Revoke unused or compromised keys immediately
                            </li>
                        </ul>
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Need More Help?</h4>
                    <div className="flex flex-col gap-2">
                        <a
                            href="https://github.com/genius-wizard-dev/Nonefinity_Agents"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                        >
                            📚 Full Documentation
                        </a>
                        <a
                            href="https://github.com/genius-wizard-dev/Nonefinity_Agents/tree/main/Nonefinity_SDK/examples"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                        >
                            💡 Code Examples
                        </a>
                        <a
                            href="https://github.com/genius-wizard-dev/Nonefinity_Agents/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                        >
                            🐛 Report Issues
                        </a>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
