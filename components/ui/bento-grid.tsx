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
        "group/bento shadow-input row-span-1 flex flex-row items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-4 transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none",
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="transition duration-200 group-hover/bento:translate-x-1">
          <div className="mb-2">
            {icon}
          </div>
          <div className="mb-2 font-inter font-semibold text-sm text-neutral-600 dark:text-neutral-200 leading-tight">
            {title}
          </div>
          <div className="font-inter text-xs font-normal text-neutral-600 dark:text-neutral-300 leading-tight">
            {description}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0">
        {header}
      </div>
    </div>
  );
};