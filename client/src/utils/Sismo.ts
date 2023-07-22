const query = `query ExampleQuery($where: Group_filter) {
    groups(where: $where, orderBy: name, orderDirection: asc) {
      id
      name
      description
      specs
      generationFrequency
    }
  }`;

export async function sismoCall() {
  const res = await fetch('https://api.sismo.io', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({query}),
  });
  const {data, errors} = await res.json();
  if (errors) {
    console.log(errors);
  }

  return data;
}
