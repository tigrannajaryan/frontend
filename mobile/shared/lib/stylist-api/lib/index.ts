import { specialFunc } from "./specialfname";

interface MyInt {
    s: string;
}

export function getStylistAPI(str: MyInt): string {
    return specialFunc(str.s);
}