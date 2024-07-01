const TruncateText = (text) => {
    const width = window.innerWidth;
    const truncatedText = (text?.length > 20) ? `...${text?.substring(text.length - (width < 768 ? 10 : 20))}` : text;
    return truncatedText
}

export default TruncateText