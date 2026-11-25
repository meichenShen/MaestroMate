import {t,useLocale} from "../i18n/locale";
import { ArrowRight, ArrowUpRight } from "lucide-react";
export function Arrow({ diagonal = false }: {
    diagonal?: boolean;
}) {
    useLocale();
    const Icon = diagonal ? ArrowUpRight : ArrowRight;
    return <Icon size={24} aria-hidden="true" strokeWidth={1.5}/>;
}
