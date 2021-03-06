import React, { useRef } from 'react';
import { Box } from "./design-system";
import RightUtilities from './components/RightUtiltities';
import Toolkit from './components/Toolkit';
import { useEffect } from 'react';
import Playground from './components/Playground/Playground';


function App() {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const fn = (e: Event) => {
            e.preventDefault()
        }
        ref.current?.addEventListener("mousewheel", fn)
        return () => window.removeEventListener("mousewheel", fn)
    })
    return (
        <Box ref={ref} display="row" rowLayout="auto 1fr auto" bg="background" justifyItems="start" justifyContent="stretch" height="100vh" width="100vw">
            <Toolkit /> 
            <Playground width="100%" height="100%" justify="center"/>
            <RightUtilities justify="end" />
        </Box>
    );
}

export default App;
