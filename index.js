const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, PermissionsBitField, ChannelFlagsBitField, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
  console.log(`Bot iniciado como ${client.user.tag}`);

  // Solicitar la ID del servidor desde la línea de comandos
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Ingrese la ID del servidor que desea borrar: ', (guildId) => {
    const guild = client.guilds.cache.get(guildId);

    if (guild) {
      console.log(`Operación de borrado iniciada para el servidor ${guild.name} con ID: (${guild.id})`);
      deleteAllChannels(guild).then(async () => {
        //Create a channel with the name "new-general" everyone can see but only you can send messages
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
        //Finaliza el proceso
        process.exit();
      });
    } else {
      console.log(`No se encontró el servidor con ID: (${guildId})`);
      return;
    }
  });
});

async function deleteAllChannels(guild) {
  try {
    // Eliminar todos los canales
    await Promise.all(guild.channels.cache.map(channel => channel.delete()));
    console.log('Todos los canales eliminados');

  } catch (error) {
    console.error('Error al eliminar canales:', error);
    throw error;
  }
}

client.login(process.env.TOKEN);
