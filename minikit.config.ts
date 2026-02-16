export default {
    appId: "quick-poll",
    name: "Quick Poll",
    subtitle: "Vote in seconds",
    description: "Create and vote on polls instantly. The fastest way to gather opinions on Base.",
    icon: "https://quickpoll.base.app/icon.svg",
    images: {
        splash: "https://quickpoll.base.app/splash.svg",
        hero: "https://quickpoll.base.app/hero.svg",
        screenshots: [
            "https://quickpoll.base.app/screenshot-1.png",
            "https://quickpoll.base.app/screenshot-2.png",
            "https://quickpoll.base.app/screenshot-3.png"
        ]
    },
    webhook: "https://quickpoll.base.app/api/webhook",
    category: "social",
    tags: ["poll", "vote", "social", "farcaster", "base"],
    manifest: {
        accountAssociation: {
            header: "eyJmaWQiOiA5OTk5LCAidHlwZSI6ICJjdXN0b2R5IiwgImtleSI6ICIweDEyMzQ1Njc4OTAifQ",
            payload: "eyJkb21haW4iOiAicXVpY2twb2xsLmJhc2UuYXBwIn0",
            signature: "MHg..."
        },
        frame: {
            version: "1",
            name: "Quick Poll",
            iconUrl: "https://quickpoll.base.app/icon.svg",
            homeUrl: "https://quickpoll.base.app",
            imageUrl: "https://quickpoll.base.app/hero.svg",
            buttonTitle: "Launch Polls",
            splashImageUrl: "https://quickpoll.base.app/splash.svg",
            splashBackgroundColor: "#0F172A",
            webhookUrl: "https://quickpoll.base.app/api/webhook"
        }
    }
};
