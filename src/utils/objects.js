// Helper to remove undefined or null properties from an object
export function removeEmpty(obj) {
    let objectData = JSON.parse(JSON.stringify(obj));
    // Protect against null/undefined object passed in
    return Object.keys(objectData || {}).reduce((x, k) => {
        // Check for null or undefined
        if (objectData[k] != null) {
            x[k] = objectData[k];
        }
        return x;
    }, {});
}