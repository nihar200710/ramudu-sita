export default function sitemap() {
  const baseUrl = 'https://ramudu-sita.onrender.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
  ];
}
