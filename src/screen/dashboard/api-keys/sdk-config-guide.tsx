import { Card, Tabs, Alert, Typography, Space } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Paragraph, Title, Text } = Typography;
const { TabPane } = Tabs;

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

  const apiUrlValue = apiUrl || window.location.origin;
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
    <div style={{ position: "relative" }}>
      <pre
        style={{
          background: "#1e1e1e",
          color: "#d4d4d4",
          padding: 16,
          borderRadius: 8,
          overflow: "auto",
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily: "'Fira Code', 'Consolas', monospace",
        }}
      >
        <code>{code}</code>
      </pre>
      <button
        onClick={() => handleCopy(code, index)}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: copiedIndex === index ? "#52c41a" : "#434343",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <CopyOutlined />
        {copiedIndex === index ? "Copied!" : "Copy"}
      </button>
    </div>
  );

  return (
    <Card title="SDK Integration Guide" style={{ marginTop: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Alert
          message="Quick Start"
          description="Follow these steps to integrate the Nonefinity AI SDK into your application."
          type="info"
          showIcon
        />

        <div>
          <Title level={4}>1. Installation</Title>
          <CodeBlock code={examples.install} index={0} />
        </div>

        <div>
          <Title level={4}>2. Basic Usage</Title>
          <Tabs defaultActiveKey="1">
            <TabPane tab="TypeScript/JavaScript" key="1">
              <CodeBlock code={examples.basicUsage} index={1} />
            </TabPane>
            <TabPane tab="React" key="2">
              <CodeBlock code={examples.react} index={2} />
            </TabPane>
            <TabPane tab="Vanilla JS" key="3">
              <CodeBlock code={examples.vanillaJS} index={3} />
            </TabPane>
          </Tabs>
        </div>

        <div>
          <Title level={4}>3. Environment Variables (Recommended)</Title>
          <Paragraph>
            <Text type="secondary">
              Store your API key securely using environment variables:
            </Text>
          </Paragraph>
          <CodeBlock code={examples.env} index={4} />
          <div style={{ marginTop: 12 }}>
            <Text strong>Usage:</Text>
            <CodeBlock code={examples.envUsage} index={5} />
          </div>
        </div>

        <Alert
          message="Security Best Practices"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Never commit API keys to version control</li>
              <li>Use environment variables for API keys</li>
              <li>Rotate keys regularly</li>
              <li>Use different keys for development and production</li>
              <li>Revoke unused or compromised keys immediately</li>
            </ul>
          }
          type="warning"
          showIcon
        />

        <div>
          <Title level={4}>Need More Help?</Title>
          <Space direction="vertical">
            <a href="https://github.com/genius-wizard-dev/Nonefinity_Agents" target="_blank" rel="noopener noreferrer">
              📚 Full Documentation
            </a>
            <a href="https://github.com/genius-wizard-dev/Nonefinity_Agents/tree/main/Nonefinity_SDK/examples" target="_blank" rel="noopener noreferrer">
              💡 Code Examples
            </a>
            <a href="https://github.com/genius-wizard-dev/Nonefinity_Agents/issues" target="_blank" rel="noopener noreferrer">
              🐛 Report Issues
            </a>
          </Space>
        </div>
      </Space>
    </Card>
  );
}
