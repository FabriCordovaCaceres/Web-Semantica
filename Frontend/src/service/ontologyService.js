const host = 'http://localhost:5000';

export const getResultQuery = async (query) => {
  await fetch(`${host}/search?query=${query}`)
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error(error);
    });
};

export const getClassInfo = async (className) => {
  const response = await fetch(`${host}/searchClass?query=${className}`);

  return await response.json();
}
