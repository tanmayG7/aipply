interface ResponsivePageContainerProps {
  children: React.ReactNode;
}

export const ResponsivePageContainer = ({
  children,
}: ResponsivePageContainerProps) => {
  return (
    <div className="flex justify-center h-full w-full">
      <div className="px-4 w-full h-full custom-sm:px-8 custom-md:px-12 custom-lg:px-[150px] custom-md:w-[1024px] custom-lg:w-[1440px]">
        {children}
      </div>
    </div>
  );
};
