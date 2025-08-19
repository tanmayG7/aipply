interface ResponsivePageContainerProps {
  children: React.ReactNode;
}

export const ResponsivePageContainer = ({
  children,
}: ResponsivePageContainerProps) => {
  return (
    <div className="flex justify-center h-full w-full">
      <div className="px-container w-full h-full max-w-[1440px] mx-auto">
        {children}
      </div>
    </div>
  );
};
