
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-grow flex flex-col justify-center items-center flex:1">
        {children}
    </div>
  );
}
