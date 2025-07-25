require("dotenv").config();

// Import necessary modules
const { REST, Routes } = require("discord.js");
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    ActivityType,
    PresenceUpdateStatus,
    Events,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

// Environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const BOT_PREFIX = process.env.BOT_PREFIX || "bbam";

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
    ],
});

client.slashCommands = new Collection();
client.prefixCommands = new Collection();

const slashCommand = async () => {
    try {
        const slashCommands = [];
        const slashCommandFiles = fs
            .readdirSync(path.join(__dirname, "commands/slash/"))
            .filter((file) => file.endsWith(".js"));

        for (const file of slashCommandFiles) {
            const command = require(`./commands/slash/${file}`);

            // Load commands into the client collection
            if ("data" in command && "execute" in command) {
                client.slashCommands.set(command.data.name, command); // Fixed: use 'command' not 'slashCommand'
                slashCommands.push(command.data.toJSON());
            } else {
                console.warn(
                    `The slash command at ${file} is missing a required "data" or "execute" property.`
                );
            }
        }

        const rest = new REST().setToken(BOT_TOKEN);
        console.log(
            `Started refreshing ${slashCommands.length} application (/) commands.`
        );

        const data = await rest.put(Routes.applicationCommands(CLIENT_ID), {
            body: slashCommands,
        });

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
        console.log(
            "Slash commands loaded in collection:",
            Array.from(client.slashCommands.keys())
        );
    } catch (error) {
        console.error("Error deploying (/) commands:", error);
    }
};

const prefixCommand = async () => {
    try {
        const prefixCommands = [];
        const prefixCommandFiles = fs
            .readdirSync(path.join(__dirname, "./commands/prefix/"))
            .filter((file) => file.endsWith(".js"));

        for (const file of prefixCommandFiles) {
            const command = require(`./commands/prefix/${file}`);

            // Load commands into the client collection
            if ("data" in command && "execute" in command) {
                client.prefixCommands.set(command.data.name, command); // Fixed: use 'command' not 'prefixCommand'
                prefixCommands.push(command.data.name);
                console.log(`Loaded prefix command: ${command.data.name}`);
            } else {
                console.warn(
                    `The prefix command at ${file} is missing a required "name" or "execute" property.`
                );
            }
        }

        console.log(
            "Prefix commands loaded in collection:",
            Array.from(client.prefixCommands.keys())
        );
    } catch (error) {
        console.error("Error loading prefix commands:", error);
    }
};

client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Fixed: Call the functions, not the collections
    await slashCommand();
    console.log("Slash commands deployed successfully!");

    await prefixCommand();
    console.log("Prefix commands deployed successfully!");

    const statusType = process.env.BOT_STATUS || "ONLINE";
    const activityType = process.env.BOT_ACTIVITY || "PLAYING";
    const activityText = process.env.BOT_ACTIVITY_TEXT || "Discord Botting";

    const activityTypeMap = {
        PLAYING: ActivityType.Playing,
        WATCHING: ActivityType.Watching,
        LISTENING: ActivityType.Listening,
        COMPETING: ActivityType.Competing,
    };

    const statusTypeMap = {
        ONLINE: PresenceUpdateStatus.Online,
        IDLE: PresenceUpdateStatus.Idle,
        DND: PresenceUpdateStatus.DoNotDisturb,
        INVISIBLE: PresenceUpdateStatus.Invisible,
    };

    client.user.setPresence({
        status: statusTypeMap[statusType] || PresenceUpdateStatus.Online,
        activities: [
            {
                name: activityText,
                type: activityTypeMap[activityType] || ActivityType.Playing,
            },
        ],
    });

    console.log(`Status set to ${statusType}`);
    console.log(`Bot activity set to ${activityType}: ${activityText}`);
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Fixed: Use slashCommands collection, not prefixCommands
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) {
        console.error(
            `No command matching ${interaction.commandName} was found.`
        );
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content:
                    "WOOPS! There was an error while executing this command!",
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content:
                    "WOOPS! There was an error while executing this command!",
                ephemeral: true,
            });
        }
    }
});

// Handle prefix commands
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    if (!message.content.toLowerCase().startsWith(BOT_PREFIX.toLowerCase()))
        return;

    const args = message.content.slice(BOT_PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);

    if (!command) {
        console.error(`No command matching ${commandName} was found.`);
        return;
    }

    try {
        await command.execute(message, args);
    } catch (error) {
        console.warn(`Error executing command ${commandName}:`, error);
        await message.reply({
            content: "WOOPS! There was an error while executing this command!",
        });
    }
});

client.login(BOT_TOKEN);
