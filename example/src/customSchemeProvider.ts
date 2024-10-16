export const CustomSchemeProvider = (urlScheme: string) => {
  return {
    createDeepLink(link: string) {
      return `${urlScheme}://link=${link}`;
    },
    parseDeepLink(deepLink: string): string | null {
      try {
        const prefix = `${urlScheme}://link=`;
        const lucraLink = deepLink.split(prefix)[1] || '';
        return lucraLink ?? null;
      } catch (error) {
        console.error('Invalid deep link:', error);
        return null;
      }
    },
  };
};
