/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	env: {
		PROJECT_ID: process.env.PROJECT_ID,
		CHANNEL_ID: process.env.CHANNEL_ID,
	},
};

module.exports = nextConfig;
