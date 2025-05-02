export const searchUsers = async (query, token, setResults, setDisplayResult) => {
    console.log(query, token, setResults, setDisplayResult);
    
    if (!query.trim()) {
        setResults([]);
        setDisplayResult(false);
        return;
    }
    try {
        const res = await fetch(`http://${process.env.NEXT_PUBLIC_GOSERVER}/api/search?target=${query}`, {
            headers: {
                'Authorization': token,
            },
        });
        if (res.ok) {
            const data = await res.json();
            setResults(data);
            setDisplayResult(true);
        }
    } catch (err) {
        console.error("Error: ", err);
    }
};
