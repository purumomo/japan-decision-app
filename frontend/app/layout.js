import './globals.css';

export const metadata = {
  title: '日本生活去留决策器',
  description: '面向在日生活人群的去留决策评估工具'
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>
        <div className="app-shell">
          {children}
          <footer className="app-footer">
            © 2026 Purumomo. All rights reserved. Powered by Purumomo AI Technologies.
          </footer>
        </div>
      </body>
    </html>
  );
}
