const fs = require('fs');
const path = require('path');
const color = require('colors');
const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const cooldownDelay = 5000; // Cooldown delay in milliseconds (5 seconds)
let lastDeletionTimestamp = 0;
const categorya = '1198247266885054493';

client.on('ready', async () => {
  console.log(`Bot iniciado como ${client.user.tag}`.america);

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Ingrese la ID del servidor que desea borrar: ', (guildId) => {
    const guild = client.guilds.cache.get(guildId);

    if (guild) {
      console.log(`Operación de borrado iniciada para el servidor ${guild.name} con ID: (${guild.id})`.yellow);
      deleteAllChannels(guild).then(async () => {
        await getRoles(guild);

        await guild.channels.create({
          name: 'mantenimiento',
          type: ChannelType.GuildText,
          permissionOverwrites: [
            {
              id: guild.roles.everyone.id,
              deny: [PermissionsBitField.Flags.SendMessages],
            },
            {
              id: client.user.id,
              allow: [PermissionsBitField.Flags.SendMessages],
            },
          ],
        });

      });
      console.log(`Operación de borrado finalizada para el servidor ${guild.name} con ID: (${guild.id})`.bgGreen);
    } else {
      console.log(`No se encontró el servidor con ID: (${guildId})`.underline.red);
      return;
    }
  });
});

async function getRoles(guild) {
  try {
    const roles = await guild.roles.fetch();
    
    const data = {};

    roles.forEach(role => {
      data[role.id] = role.members.map(member => member.user.id);
    });

    fs.writeFileSync(path.join(__dirname, 'roles.json'), JSON.stringify(data, null, 2));
    console.log(" ");
    console.log('Roles guardados'.bgGreen);

  } catch (error) {
    console.error('Error al obtener roles:'.underline.red, error);
    throw error;
  }
}

async function deleteAllChannels(guild) {
  try {
    const currentTimestamp = Date.now();

    // Check if the cooldown period has passed
    if (currentTimestamp - lastDeletionTimestamp < cooldownDelay) {
      console.log(`Cooldown activo. Esperando ${cooldownDelay / 1000} segundos antes de borrar más canales.`);
      return;
    }

    // Delete channels with a cooldown in between
    await Promise.all(guild.channels.cache.map(async (channel) => {
      try {
        // Check if the channel is the specific category to be preserved
        if (channel.id === categorya && channel.type === ChannelType.GuildCategory) {
          console.log(`Categoría ${channel.name} preservada`);
          return;
        }

        // Check if the channel is a text channel within the specified category
        if (channel.parentId === categorya && channel.type === ChannelType.GuildText) {
          console.log(`Canal ${channel.name} dentro de la categoría preservada`);
          return;
        }

        // Delete other channels
        await channel.delete();
        console.log(`Canal ${channel.name} borrado`);
      } catch (error) {
        console.error(`Error al borrar el canal ${channel.name}:`, error);
      }
    }));

    // Update the last deletion timestamp
    lastDeletionTimestamp = currentTimestamp;

    console.log('Todos los canales borrados excepto la categoría y sus canales internos.');
  } catch (error) {
    console.error('Error durante el borrado de canales:', error);
    throw error;
  }
}

client.login(process.env.TOKEN);