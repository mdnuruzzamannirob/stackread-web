'use client'

interface AuthHeroSectionProps {
  backgroundImage: string
  title: string
  description: string
}

const AuthHeroSection = ({
  backgroundImage,
  title,
  description,
}: AuthHeroSectionProps) => {
  return (
    <section className="fixed left-0 top-0 hidden lg:block h-dvh w-1/2 overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.86)), url('${backgroundImage}')`,
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/25 to-black/95" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-black/92 to-transparent" />

      <div className="relative z-10 flex h-dvh flex-col px-10 py-8 text-white">
        <div className="text-[22px] font-semibold tracking-[-0.04em] text-white">
          StackRead
        </div>

        <div className="flex flex-1 items-center justify-center px-8">
          <div className="max-w-124 text-center">
            <h2 className="text-balance text-[3.85rem] font-semibold leading-[0.94] tracking-[-0.06em] text-white xl:text-[4.2rem]">
              {title}
            </h2>
            <p className="mx-auto mt-7 max-w-md text-pretty text-[1.12rem] leading-8 text-white/90 xl:text-[1.2rem] xl:leading-9">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthHeroSection
