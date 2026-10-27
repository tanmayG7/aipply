import { IconBrandApple, IconBrandWindows } from "@tabler/icons-react";

const WINDOWS_DOWNLOAD_URL =
  "https://aipplydownload.blob.core.windows.net/downloads/AiPply-Setup-Latest.exe";

export default function DesktopAppCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1F242F] bg-[#0C111D] p-5">
      <div>
        <h2 className="font-inter text-[#ECECED] font-semibold text-lg">
          Get the desktop app
        </h2>
        <p className="font-inter text-[#94969C] text-sm">
          Run AiPply on your computer for faster, more reliable auto apply.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <a
          href={WINDOWS_DOWNLOAD_URL}
          className="flex items-center gap-2 font-manrope font-bold uppercase text-[14px] leading-[20px] text-white bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] rounded-full px-5 py-3 hover:opacity-90 transition-opacity"
        >
          <IconBrandWindows size={18} aria-hidden="true" />
          Download for Windows
        </a>
        <span
          aria-disabled="true"
          className="flex items-center gap-2 font-manrope font-bold uppercase text-[14px] leading-[20px] text-[#85888E] border border-[#333741] rounded-full px-5 py-3 cursor-not-allowed select-none"
        >
          <IconBrandApple size={18} aria-hidden="true" />
          Mac — Coming soon
        </span>
      </div>
      <p className="font-manrope font-normal text-[13px] leading-[20px] text-[#94969C]">
        Windows may show a security warning. Click More info → Run anyway.
      </p>
    </div>
  );
}
