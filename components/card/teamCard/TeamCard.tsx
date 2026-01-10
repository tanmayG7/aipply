import Image from "next/image";

interface TeamCardProps {
  name: string;
  role: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export default function TeamCard({
  name,
  role,
  description,
  imageSrc,
  imageAlt,
}: TeamCardProps) {
  return (
    <div className="bg-[#111111] p-8 rounded-[30px] border border-[#333741]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={96}
        height={96}
        className="mx-auto mb-6 rounded-full object-cover"
      />
      <h3 className="font-manrope text-[24px] font-bold text-white mb-2 text-center">
        {name}
      </h3>
      <p className="font-manrope text-[18px] font-semibold text-[#52A9FF] mb-4 text-center">
        {role}
      </p>
      <p className="font-manrope text-[16px] text-[#CECFD2] leading-[150%]">
        <em>{description}</em>
      </p>
    </div>
  );
}
