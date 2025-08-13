import { useState } from "react";

const useAnimateText = (phrases: Array<string>, speed: number = 30, pause: number = 2500) => {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');

    const phrase = phrases[phraseIndex]
    let interval: NodeJS.Timeout | undefined

    const setAnimatedText = () => {
        let i = 0;
        let currentText = '';
        setDisplayedText('');

        interval = setInterval(() => {
            if (i < phrase.length) {
                currentText += phrase[i];
                setDisplayedText(currentText);
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    setPhraseIndex((prev) => (prev + 1) % phrases.length);
                }, 2500);
            }
        }, speed);
    }

    const animatedElements = {interval, phrase, displayedText}

    return {animatedElements, setAnimatedText}
}

export default useAnimateText