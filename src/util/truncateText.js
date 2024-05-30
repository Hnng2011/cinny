const TruncateText = (text) => {
    const truncatedText = (text?.length > 20) ? `...${text?.substring(text.length - 20)}` : text;
    return truncatedText
}

export default TruncateText