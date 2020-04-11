import styled from "styled-components";
import { injectDNA } from "../dna/index";
import { injectFont } from "../dna/fonts";
import { DNA } from "../theme/index.d";
import { matchColorToTheme } from "../dna/styling";

export default styled.h1<DNA>`
    ${props => injectFont(props, "header")}
    ${props => injectDNA(props, {
        fg: "foreground",
        m: 0
    })}
`