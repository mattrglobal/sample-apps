/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/manifest.json',
        destination: 'https://trustco.vii.au01.mattr.global/manifest.json',
        permanent: true,
      },
      {
        source: '/.well-known/did-configuration',
        destination:
          'https://trustco.vii.au01.mattr.global/.well-known/did-configuration',
        permanent: true,
      },
      {
        source: '/.well-known/did.json',
        destination:
          'https://trustco.vii.au01.mattr.global/.well-known/did.json',
        permanent: true,
      },
      {
        source: '/.well-known/openid-credential-issuer',
        destination: 'https://trustco.vii.au01.mattr.global/.well-known/openid-credential-issuer',
        permanent: true,
      },
    ];
  },
};

module.exports =nextConfig;
