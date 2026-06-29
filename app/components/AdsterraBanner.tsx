"use client";

type AdsterraBannerProps = {
  adKey: string;
  width: number;
  height: number;
};

export default function AdsterraBanner({
  adKey,
  width,
  height,
}: AdsterraBannerProps) {
  const adHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: ${width}px;
            height: ${height}px;
            overflow: hidden;
            background: transparent;
          }
        </style>
      </head>

      <body>
        <script>
          var atOptions = {
            key: "${adKey}",
            format: "iframe",
            height: ${height},
            width: ${width},
            params: {}
          };
        </script>

        <script src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="flex w-full justify-center">
      <iframe
        title={`Advertisement ${adKey}`}
        srcDoc={adHtml}
        width={width}
        height={height}
        scrolling="no"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        className="border-0"
      />
    </div>
  );
}