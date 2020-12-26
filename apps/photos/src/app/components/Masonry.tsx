import React from "react";

const Layout: React.FC = ({ children }) => (
  <div>
    <div>{children}</div>
    <style jsx global>{`
      body {
        margin: 0;
      }
    `}</style>
  </div>
);

export default Layout;
