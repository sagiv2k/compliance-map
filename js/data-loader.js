/* Data loader — fetches all three JSON files and returns a combined object */
const DataLoader = {
  async loadAll() {
    const cb = Date.now();
    const urls = {
      regulations: './data/regulations.json?cb=' + cb,
      standards:   './data/standards.json?cb='   + cb,
      mappings:    './data/mappings.json?cb='     + cb
    };

    const responses = await Promise.all(
      Object.values(urls).map(url => fetch(url))
    );

    for (const res of responses) {
      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status} loading ${res.url}. ` +
          'Run the site through a local server (e.g. python -m http.server 8080) rather than opening index.html directly.'
        );
      }
    }

    const [regs, stds, maps] = await Promise.all(responses.map(r => r.json()));

    return {
      regulations:  regs.regulations,
      standards:    stds.standards,
      mappings:     maps.mappings,
      version:      regs.version,
      last_updated: regs.last_updated
    };
  }
};
