import { PrismaClient, CategoriaInsumo } from "@prisma/client";

const prisma = new PrismaClient();

const mdfs: { nome: string; valorUnitario: number }[] = [
  {
    "nome": "MDF Absoluto - Preto 15",
    "valorUnitario": 158.09
  },
  {
    "nome": "MDF Almeria 15",
    "valorUnitario": 113.34
  },
  {
    "nome": "MDF Almeria 6",
    "valorUnitario": 83.93
  },
  {
    "nome": "MDF Amarelo Gema 15",
    "valorUnitario": 150.44
  },
  {
    "nome": "MDF Amendola Rustica 15",
    "valorUnitario": 118.3
  },
  {
    "nome": "MDF Amendola Rustica 6",
    "valorUnitario": 78.76
  },
  {
    "nome": "MDF Areia de Noronha 15",
    "valorUnitario": 129.74
  },
  {
    "nome": "MDF Areia de Noronha 6",
    "valorUnitario": 95.19
  },
  {
    "nome": "MDF Arenas Grafis 15",
    "valorUnitario": 117.45
  },
  {
    "nome": "MDF Arenas Grafis 6",
    "valorUnitario": 85.56
  },
  {
    "nome": "MDF Arenito 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Arenito 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Asfalto 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Asfalto 6",
    "valorUnitario": 89.8
  },
  {
    "nome": "MDF Aurora 15",
    "valorUnitario": 115.61
  },
  {
    "nome": "MDF Aurora 6",
    "valorUnitario": 76.17
  },
  {
    "nome": "MDF Azul Astral 15",
    "valorUnitario": 158.95
  },
  {
    "nome": "MDF Azul Astral 6",
    "valorUnitario": 109.39
  },
  {
    "nome": "MDF Azul Indigo 15",
    "valorUnitario": 106.53
  },
  {
    "nome": "MDF Azul Profundo 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Azul Profundo 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Azul Secreto 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Azul Secreto 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Blush 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Blush 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Branco Acetinatta 15",
    "valorUnitario": 244.66
  },
  {
    "nome": "MDF Branco Ártico Trama 15",
    "valorUnitario": 101.46
  },
  {
    "nome": "MDF Branco Diamante Essencial 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Branco Diamante Essencial 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Branco Diamante Cristallo 15",
    "valorUnitario": 194.31
  },
  {
    "nome": "MDF Branco Diamante Trama 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Branco Diamante Trama 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Branco Ranhurado 18",
    "valorUnitario": 148.42
  },
  {
    "nome": "MDF Branco Tx 25",
    "valorUnitario": 156.14
  },
  {
    "nome": "MDF Branco Tx 18",
    "valorUnitario": 104.98
  },
  {
    "nome": "MDF Branco Tx 15",
    "valorUnitario": 81.89
  },
  {
    "nome": "MDF Branco Tx 9",
    "valorUnitario": 77.1
  },
  {
    "nome": "MDF Branco Tx 6",
    "valorUnitario": 62.25
  },
  {
    "nome": "MDF Branco Ultra 18",
    "valorUnitario": 140.43
  },
  {
    "nome": "MDF Branco Ultra 15",
    "valorUnitario": 111.7
  },
  {
    "nome": "MDF Branco Ultra 6",
    "valorUnitario": 75.34
  },
  {
    "nome": "MDF Brise 15",
    "valorUnitario": 150.26
  },
  {
    "nome": "MDF Cacau Natural 15",
    "valorUnitario": 150.44
  },
  {
    "nome": "MDF Cacau Natural 6",
    "valorUnitario": 111.42
  },
  {
    "nome": "MDF Café Torrado 15",
    "valorUnitario": 96.0
  },
  {
    "nome": "MDF Café Torrado 6",
    "valorUnitario": 74.75
  },
  {
    "nome": "MDF Camapu 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Camapu 6",
    "valorUnitario": 98.79
  },
  {
    "nome": "MDF Caravela 15",
    "valorUnitario": 98.75
  },
  {
    "nome": "MDF Carbon 15",
    "valorUnitario": 110.22
  },
  {
    "nome": "MDF Carbon 6",
    "valorUnitario": 82.06
  },
  {
    "nome": "MDF Carbono 15",
    "valorUnitario": 109.46
  },
  {
    "nome": "MDF Carbono 6",
    "valorUnitario": 77.27
  },
  {
    "nome": "MDF Carvalho Avelã 15",
    "valorUnitario": 158.09
  },
  {
    "nome": "MDF Carvalho Avelã 6",
    "valorUnitario": 108.8
  },
  {
    "nome": "MDF Carvalho Batur 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Carvalho Batur 6",
    "valorUnitario": 99.86
  },
  {
    "nome": "MDF Carvalho Berlin 18",
    "valorUnitario": 189.7
  },
  {
    "nome": "MDF Carvalho Berlin 15",
    "valorUnitario": 158.09
  },
  {
    "nome": "MDF Carvalho Berlin 6",
    "valorUnitario": 108.8
  },
  {
    "nome": "MDF Carvalho Dian 15",
    "valorUnitario": 115.61
  },
  {
    "nome": "MDF Carvalho Dian 6",
    "valorUnitario": 78.76
  },
  {
    "nome": "MDF Carvalho Hanover 15",
    "valorUnitario": 158.09
  },
  {
    "nome": "MDF Carvalho Hanover 6",
    "valorUnitario": 108.8
  },
  {
    "nome": "MDF Carvalho Lir 15",
    "valorUnitario": 88.85
  },
  {
    "nome": "MDF Carvalho Lir 6",
    "valorUnitario": 78.76
  },
  {
    "nome": "MDF Carvalho Malva 15",
    "valorUnitario": 158.09
  },
  {
    "nome": "MDF Carvalho Malva 6",
    "valorUnitario": 108.8
  },
  {
    "nome": "MDF Carvalho Valdez 15",
    "valorUnitario": 123.98
  },
  {
    "nome": "MDF Carvalho Valdez 6",
    "valorUnitario": 84.88
  },
  {
    "nome": "MDF Castanha de Cajú 15",
    "valorUnitario": 92.25
  },
  {
    "nome": "MDF Cimento 15",
    "valorUnitario": 118.81
  },
  {
    "nome": "MDF Cinnamon 15",
    "valorUnitario": 98.93
  },
  {
    "nome": "MDF Cinza Fóssil 15",
    "valorUnitario": 155.33
  },
  {
    "nome": "MDF Cinza Fóssil 6",
    "valorUnitario": 104.64
  },
  {
    "nome": "MDF Cinza Italia 15",
    "valorUnitario": 143.68
  },
  {
    "nome": "MDF Cinza Lunar 15",
    "valorUnitario": 118.81
  },
  {
    "nome": "MDF Cinza Madero 15",
    "valorUnitario": 132.22
  },
  {
    "nome": "MDF Cinza Sagrado 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Cinza Sagrado 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Cinza Sagrado Cristallo 15",
    "valorUnitario": 194.31
  },
  {
    "nome": "MDF Cinza Supremo Soft Mate 15",
    "valorUnitario": 129.74
  },
  {
    "nome": "MDF Cinza Supremo Soft Mate 6",
    "valorUnitario": 95.19
  },
  {
    "nome": "MDF Cinza Urbano Soft Mate 15",
    "valorUnitario": 129.74
  },
  {
    "nome": "MDF Cinza Urbano Soft Mate 6",
    "valorUnitario": 95.19
  },
  {
    "nome": "MDF City 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF City 6",
    "valorUnitario": 89.8
  },
  {
    "nome": "MDF Compensado Flexivel Mole 15",
    "valorUnitario": 105.0
  },
  {
    "nome": "MDF Compensado Naval 15",
    "valorUnitario": 150.0
  },
  {
    "nome": "MDF Compensado Naval 6",
    "valorUnitario": 73.93
  },
  {
    "nome": "MDF Concrete 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Concrete 6",
    "valorUnitario": 89.8
  },
  {
    "nome": "MDF Cristal 15",
    "valorUnitario": 105.35
  },
  {
    "nome": "MDF Cristal 6",
    "valorUnitario": 68.91
  },
  {
    "nome": "MDF Cristal Aqua 15",
    "valorUnitario": 129.74
  },
  {
    "nome": "MDF Cronos 15",
    "valorUnitario": 118.81
  },
  {
    "nome": "MDF Cru Premium 6",
    "valorUnitario": 45.15
  },
  {
    "nome": "MDF Cru Premium 15",
    "valorUnitario": 76.38
  },
  {
    "nome": "MDF Cru Premium 18",
    "valorUnitario": 97.5
  },
  {
    "nome": "MDF Cru Ultra 15",
    "valorUnitario": 75.13
  },
  {
    "nome": "MDF Cumaru Raiz 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Cumaru Raiz 6",
    "valorUnitario": 99.86
  },
  {
    "nome": "MDF Downtown 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Downtown 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Dunas 15",
    "valorUnitario": 129.74
  },
  {
    "nome": "MDF Dunas 6",
    "valorUnitario": 95.19
  },
  {
    "nome": "MDF Durban 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Durban 6",
    "valorUnitario": 89.8
  },
  {
    "nome": "MDF Elmo Aracruz 15",
    "valorUnitario": 98.75
  },
  {
    "nome": "MDF Elmo Avila 15",
    "valorUnitario": 123.98
  },
  {
    "nome": "MDF Elmo Avila 6",
    "valorUnitario": 84.88
  },
  {
    "nome": "MDF Elmo Palmares 15",
    "valorUnitario": 98.75
  },
  {
    "nome": "MDF Elmo Palmares 6",
    "valorUnitario": 74.5
  },
  {
    "nome": "MDF Fendi Super Mate 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Fendi Super Mate 6",
    "valorUnitario": 89.8
  },
  {
    "nome": "MDF Fendi Mesh 15",
    "valorUnitario": 110.76
  },
  {
    "nome": "MDF Floresta 15",
    "valorUnitario": 132.09
  },
  {
    "nome": "MDF Floresta 6",
    "valorUnitario": 89.8
  },
  {
    "nome": "MDF Freijo 15",
    "valorUnitario": 109.75
  },
  {
    "nome": "MDF Freijo Brasil 15",
    "valorUnitario": 129.74
  },
  {
    "nome": "MDF Freijo Imperial 15",
    "valorUnitario": 150.08
  },
  {
    "nome": "MDF Freijo Imperial 6",
    "valorUnitario": 103.48
  },
  {
    "nome": "MDF Freijo Louro 15",
    "valorUnitario": 150.34
  },
  {
    "nome": "MDF Freijo Louro 6",
    "valorUnitario": 111.34
  },
  {
    "nome": "MDF Freijo Puro 15",
    "valorUnitario": 142.55
  },
  {
    "nome": "MDF Freijo Puro 6",
    "valorUnitario": 95.52
  },
  {
    "nome": "MDF Freijo Puro Ultra 15",
    "valorUnitario": 153.66
  },
  {
    "nome": "MDF Freijó Tucumã 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Freijó Tucumã 6",
    "valorUnitario": 98.79
  },
  {
    "nome": "MDF Giaduia Velluto 15",
    "valorUnitario": 155.33
  },
  {
    "nome": "MDF Giaduia Velluto 6",
    "valorUnitario": 104.64
  },
  {
    "nome": "MDF Gianduia Cristallo 15",
    "valorUnitario": 194.31
  },
  {
    "nome": "MDF Gianduia Puro 15",
    "valorUnitario": 117.02
  },
  {
    "nome": "MDF Gianduia Trama 18",
    "valorUnitario": 135.48
  },
  {
    "nome": "MDF Gianduia Trama 15",
    "valorUnitario": 112.92
  },
  {
    "nome": "MDF Gianduia Trama 6",
    "valorUnitario": 76.17
  },
  {
    "nome": "MDF Gianduia Ultra 15",
    "valorUnitario": 150.08
  },
  {
    "nome": "MDF Grafite Trama 15",
    "valorUnitario": 142.55
  },
  {
    "nome": "MDF Grafite Trama 6",
    "valorUnitario": 95.53
  },
  {
    "nome": "MDF Grafite Acetinatta 15",
    "valorUnitario": 244.66
  },
  {
    "nome": "MDF Grafite Acetinatta 6",
    "valorUnitario": 172.19
  },
  {
    "nome": "MDF Grão 15",
    "valorUnitario": 106.53
  },
  {
    "nome": "MDF Hibisco 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Hibisco 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Italian Noce Matt Soft 15",
    "valorUnitario": 129.74
  },
  {
    "nome": "MDF Italian Noce Matt Soft 6",
    "valorUnitario": 95.19
  },
  {
    "nome": "MDF Itapuã 15",
    "valorUnitario": 142.55
  },
  {
    "nome": "MDF Itapuã 6",
    "valorUnitario": 95.52
  },
  {
    "nome": "MDF Itapuã Ultra 15",
    "valorUnitario": 153.66
  },
  {
    "nome": "MDF Jacarandá 15",
    "valorUnitario": 98.75
  },
  {
    "nome": "MDF Jacarandá 6",
    "valorUnitario": 73.75
  },
  {
    "nome": "MDF Jequitibá Rosa 15",
    "valorUnitario": 142.55
  },
  {
    "nome": "MDF Jequitibá Rosa 6",
    "valorUnitario": 95.52
  },
  {
    "nome": "MDF Kiev 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Lamina Dourada 15",
    "valorUnitario": 140.81
  },
  {
    "nome": "MDF Lamina Dourada 6",
    "valorUnitario": 103.87
  },
  {
    "nome": "MDF Lenho 15",
    "valorUnitario": 113.34
  },
  {
    "nome": "MDF Lenho 6",
    "valorUnitario": 83.93
  },
  {
    "nome": "MDF Maga Rosa 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Maga Rosa 6",
    "valorUnitario": 89.8
  },
  {
    "nome": "MDF Magma 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Marron Gruta 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Marron Gruta 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Mint 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Mint 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Moss - Absoluto 15",
    "valorUnitario": 158.09
  },
  {
    "nome": "MDF Moss - Absoluto 6",
    "valorUnitario": 108.8
  },
  {
    "nome": "MDF Natural Oak 15",
    "valorUnitario": 140.81
  },
  {
    "nome": "MDF Natural Oak 6",
    "valorUnitario": 103.87
  },
  {
    "nome": "MDF Nazca 15",
    "valorUnitario": 158.95
  },
  {
    "nome": "MDF Noce Amendoa 15",
    "valorUnitario": 117.02
  },
  {
    "nome": "MDF Noce Amendoa 6",
    "valorUnitario": 81.04
  },
  {
    "nome": "MDF Noce Mare 15",
    "valorUnitario": 117.02
  },
  {
    "nome": "MDF Noce Oro 15",
    "valorUnitario": 140.81
  },
  {
    "nome": "MDF Noce Oro 6",
    "valorUnitario": 103.87
  },
  {
    "nome": "MDF Nogal Amendoado 15",
    "valorUnitario": 107.67
  },
  {
    "nome": "MDF Nogal Amendoado 6",
    "valorUnitario": 83.93
  },
  {
    "nome": "MDF Nogueira Açaí 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Nogueira Açaí 6",
    "valorUnitario": 98.79
  },
  {
    "nome": "MDF Nogueira Asti 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Nogueira Caiapó 15",
    "valorUnitario": 109.75
  },
  {
    "nome": "MDF Nogueira Caiapó 6",
    "valorUnitario": 77.5
  },
  {
    "nome": "MDF Nogueira Caiena 15",
    "valorUnitario": 158.09
  },
  {
    "nome": "MDF Nogueira Caiena 6",
    "valorUnitario": 108.8
  },
  {
    "nome": "MDF Nogueira Florida 18",
    "valorUnitario": 189.7
  },
  {
    "nome": "MDF Nogueira Florida 15",
    "valorUnitario": 158.09
  },
  {
    "nome": "MDF Nogueira Florida 6",
    "valorUnitario": 108.8
  },
  {
    "nome": "MDF Nogueira Imperial 15",
    "valorUnitario": 107.67
  },
  {
    "nome": "MDF Nogueira Imperial 6",
    "valorUnitario": 83.93
  },
  {
    "nome": "MDF Nogueira Modena 15",
    "valorUnitario": 123.98
  },
  {
    "nome": "MDF Nogueira Modena 6",
    "valorUnitario": 84.88
  },
  {
    "nome": "MDF Nogueira Thar 15",
    "valorUnitario": 158.09
  },
  {
    "nome": "MDF Nogueira Thar 6",
    "valorUnitario": 108.8
  },
  {
    "nome": "MDF Nogueira Udine 15",
    "valorUnitario": 123.98
  },
  {
    "nome": "MDF Nogueira Udine 6",
    "valorUnitario": 84.88
  },
  {
    "nome": "MDF Nogueira Veneto 15",
    "valorUnitario": 123.98
  },
  {
    "nome": "MDF Nogueira Veneto 6",
    "valorUnitario": 84.88
  },
  {
    "nome": "MDF Oasis 18",
    "valorUnitario": 171.06
  },
  {
    "nome": "MDF Oasis 15",
    "valorUnitario": 142.55
  },
  {
    "nome": "MDF Oasis 6",
    "valorUnitario": 99.86
  },
  {
    "nome": "MDF Ocre Solar 15",
    "valorUnitario": 158.95
  },
  {
    "nome": "MDF Off-White Suave 15",
    "valorUnitario": 114.36
  },
  {
    "nome": "MDF Off-White Suave 6",
    "valorUnitario": 75.34
  },
  {
    "nome": "MDF Opala Cristallo 15",
    "valorUnitario": 194.31
  },
  {
    "nome": "MDF Ovo 15",
    "valorUnitario": 107.8
  },
  {
    "nome": "MDF Palha Trama 15",
    "valorUnitario": 115.61
  },
  {
    "nome": "MDF Palha Trama 6",
    "valorUnitario": 76.17
  },
  {
    "nome": "MDF Pau Ferro - Flora 15",
    "valorUnitario": 132.09
  },
  {
    "nome": "MDF Pau Ferro 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Pau Ferro 6",
    "valorUnitario": 99.86
  },
  {
    "nome": "MDF Pétala Rosa 15",
    "valorUnitario": 129.74
  },
  {
    "nome": "MDF Pétala Rosa 6",
    "valorUnitario": 95.19
  },
  {
    "nome": "MDF Peroba Rosa 15",
    "valorUnitario": 140.81
  },
  {
    "nome": "MDF Peroba Rosa 6",
    "valorUnitario": 103.87
  },
  {
    "nome": "MDF Perola Absoluto 15",
    "valorUnitario": 158.09
  },
  {
    "nome": "MDF Perola Urbana 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Perola Urbana 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Pietrasanta 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Pimenta do Reino 15",
    "valorUnitario": 94.75
  },
  {
    "nome": "MDF Pimenta do Reino 6",
    "valorUnitario": 72.25
  },
  {
    "nome": "MDF Pinole 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Pitanga 15",
    "valorUnitario": 96.25
  },
  {
    "nome": "MDF Poente 15",
    "valorUnitario": 96.25
  },
  {
    "nome": "MDF Poente 6",
    "valorUnitario": 68.75
  },
  {
    "nome": "MDF Portoro 15",
    "valorUnitario": 157.23
  },
  {
    "nome": "MDF Prata 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Prata 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Preto Acetinatta 15",
    "valorUnitario": 244.66
  },
  {
    "nome": "MDF Preto Acetinatta 6",
    "valorUnitario": 172.19
  },
  {
    "nome": "MDF Preto Cristallo 15",
    "valorUnitario": 194.31
  },
  {
    "nome": "MDF Preto Trama 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Preto Trama 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Preto Tx 18",
    "valorUnitario": 126.43
  },
  {
    "nome": "MDF Preto Tx 15",
    "valorUnitario": 105.35
  },
  {
    "nome": "MDF Preto Tx 6",
    "valorUnitario": 68.91
  },
  {
    "nome": "MDF Preto Ultra 15",
    "valorUnitario": 116.21
  },
  {
    "nome": "MDF Preto Ultra 6",
    "valorUnitario": 80.17
  },
  {
    "nome": "MDF Proa 15",
    "valorUnitario": 113.34
  },
  {
    "nome": "MDF Relva 15",
    "valorUnitario": 106.53
  },
  {
    "nome": "MDF Riviera Cross 15",
    "valorUnitario": 115.61
  },
  {
    "nome": "MDF Riviera Cross 6",
    "valorUnitario": 78.76
  },
  {
    "nome": "MDF Rocha Rara 18",
    "valorUnitario": 162.87
  },
  {
    "nome": "MDF Rosa Glamour 15",
    "valorUnitario": 145.69
  },
  {
    "nome": "MDF Rosa Infinito 15",
    "valorUnitario": 145.86
  },
  {
    "nome": "MDF Rosa Infinito 6",
    "valorUnitario": 99.87
  },
  {
    "nome": "MDF Rosa Milkshake 15",
    "valorUnitario": 126.46
  },
  {
    "nome": "MDF Rosa Milkshake 6",
    "valorUnitario": 86.93
  },
  {
    "nome": "MDF Saara 15",
    "valorUnitario": 118.81
  },
  {
    "nome": "MDF Safira 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Seiva 15",
    "valorUnitario": 101.46
  },
  {
    "nome": "MDF Sereno 18",
    "valorUnitario": 142.99
  },
  {
    "nome": "MDF Sereno 15",
    "valorUnitario": 133.41
  },
  {
    "nome": "MDF Sereno 6",
    "valorUnitario": 89.8
  },
  {
    "nome": "MDF Tartufo Acetinatta 15",
    "valorUnitario": 244.66
  },
  {
    "nome": "MDF Tartufo Acetinatta 6",
    "valorUnitario": 172.19
  },
  {
    "nome": "MDF Teka Soho 15",
    "valorUnitario": 150.08
  },
  {
    "nome": "MDF Teka Soho 6",
    "valorUnitario": 103.48
  },
  {
    "nome": "MDF Thassos Ultra 15",
    "valorUnitario": 157.23
  },
  {
    "nome": "MDF Titânio Cristallo 15",
    "valorUnitario": 194.31
  },
  {
    "nome": "MDF Titânio Sublime 15",
    "valorUnitario": 123.98
  },
  {
    "nome": "MDF Titânio Trama 15",
    "valorUnitario": 112.92
  },
  {
    "nome": "MDF Titânio Trama 6",
    "valorUnitario": 76.17
  },
  {
    "nome": "MDF Titânio Ultra 15",
    "valorUnitario": 150.08
  },
  {
    "nome": "MDF Titânio Velluto 15",
    "valorUnitario": 132.04
  },
  {
    "nome": "MDF Titânio Velluto 6",
    "valorUnitario": 87.96
  },
  {
    "nome": "MDF Trancoso 15",
    "valorUnitario": 145.15
  },
  {
    "nome": "MDF Trancoso 6",
    "valorUnitario": 108.57
  },
  {
    "nome": "MDF Trevi 15",
    "valorUnitario": 308.4
  },
  {
    "nome": "MDF Urucum 15",
    "valorUnitario": 93.25
  },
  {
    "nome": "MDF Verde Floresta 18",
    "valorUnitario": 180.1
  },
  {
    "nome": "MDF Verde Floresta 15",
    "valorUnitario": 155.33
  },
  {
    "nome": "MDF Verde Floresta 6",
    "valorUnitario": 104.64
  },
  {
    "nome": "MDF Verde Mar 15",
    "valorUnitario": 129.74
  },
  {
    "nome": "MDF Verde Mar 6",
    "valorUnitario": 95.19
  },
  {
    "nome": "MDF Viena 15",
    "valorUnitario": 126.74
  },
  {
    "nome": "MDF Viena 6",
    "valorUnitario": 89.8
  },
  {
    "nome": "MDF Vitória-Régia 15",
    "valorUnitario": 96.25
  }
];

async function main() {
  const existentes = await prisma.insumo.count({ where: { categoria: CategoriaInsumo.MDF } });
  if (existentes > 0) {
    console.log(`Já existem ${existentes} insumos de MDF cadastrados — pulando importação.`);
    return;
  }

  const resultado = await prisma.insumo.createMany({
    data: mdfs.map((m) => ({
      nome: m.nome,
      categoria: CategoriaInsumo.MDF,
      unidade: "m²",
      valorUnitario: m.valorUnitario,
      ativo: true,
    })),
  });

  console.log(`Importados ${resultado.count} insumos de MDF.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
