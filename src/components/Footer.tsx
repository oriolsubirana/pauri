import type { Dictionary } from '@/dictionaries'

export function Footer({ dict }: { dict: Dictionary }) {
    return (
        <footer className="border-t border-sand py-8">
            <div className="container-main flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="font-sans text-xs text-stone">
                    {dict.footer.made_with}{' '}
                    <span className="font-serif text-olive">{dict.footer.couple}</span>
                    &nbsp;♡
                </p>
                <p className="font-sans text-xs text-stone/60">19.09.2026</p>
            </div>
        </footer>
    )
}
