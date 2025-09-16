import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group/bento shadow-input row-span-1 flex flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 sm:px-6 py-4 sm:py-5 transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none",
        className,
      )}
    >
      <div className="flex flex-col justify-center min-w-0 flex-1 mr-3 sm:mr-5">
        <div className="transition duration-200 group-hover/bento:translate-x-1">
          <div className="mb-2 flex items-center">
            {icon}
          </div>
          <div className="mb-1 font-inter font-semibold text-xs sm:text-sm text-neutral-600 dark:text-neutral-200 leading-tight line-clamp-1">
            {title}
          </div>
          <div className="font-inter text-xs text-neutral-600 dark:text-neutral-300 leading-tight opacity-80 break-words line-clamp-2">
            {description}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center flex-shrink-0">
        {header}
      </div>
    </div>
  );
};