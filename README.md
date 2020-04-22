# Blockchain

## Índice

1. [Estructura del proyecto](#estructura-del-proyecto)
2. [Interfaces](#interfaces)
   - [Transacción](#transacción)
     - Atributos
     - Métodos
   - [Bloque](#bloque)
     - Atributos
     - Métodos
   - [Blockchain](#blockchain)
     - Atributos
     - Métodos
3. [Rutas de la API](#rutas-de-la-api)
   - [Obtener la blockchain](#obtener-la-blockchain)
   - [Obtener un bloque](#obtener-un-bloque)
   - [Obtener una transacción](#obtener-una-transacción)
   - [Obtener el saldo de una dirección](#obtener-el-saldo-de-una-dirección)
   - [Enviar una transacción](#enviar-una-transacción)
   - [Minar el siguiente bloque](#minar-el-siguiente-bloque)
   - [Realizar el algoritmo de consenso](#realizar-el-algoritmo-de-consenso)
4. [Controlador](#controlador)
5. [Librerías utilizadas](#librerías-utilizadas)
   - [express](#express)
   - [axios](#axios)
   - [sha256](#sha256)
   - [elliptic](#elliptic)
   - [uuid](#uuid)

## Estructura del proyecto

    .
    ├── node_modules                        # código de las librerías descargadas
    ├── build                               # resultado de transpilar el directorio /src
    ├── src                                 # directorio donde se encuentra el código en Typescript
    │   ├── controllers                     # controladores de la API
    |   |   └── blockchain.controller.ts    # controlador de la blockchain
    │   ├── interfaces                      # interfaces
    |   |   ├── transaction.interface.ts    # interfaz que implementa la clase de la transacción
    |   |   ├── block.interface.ts          # interfaz que implementa la clase del bloque
    |   |   └── blockchain.interface.ts     # interfaz que implementa la clase de la blockchain
    |   ├── models                          # modelos
    |   |   ├── transaction.model.ts        # modelo de transacción
    |   |   ├── block.model.ts              # modelo de bloque
    |   |   └── blockchain.model.ts         # modelo de blockchain
    |   ├── routes                          # rutas de la API
    |   |   └── routes.ts                   # rutas de la blockchain
    │   └── server.ts                       # aplicación del servidor
    └── package.json                        # archivo de configuración del proyecto

## Interfaces

- ## Transacción

### Atributos

```typescript
id: string;                 # identificador único
fromAddress: string;        # dirección pública del emisor de la transacción
toAddress: string;          # dirección pública del receptor de la transacción
amount: number;             # cantidad de bitcoins a enviar
signature?: string;         # firma del emisor de la transacción
```

### Métodos

```typescript
/**
 * Genera un identificador único al crear una transacción.
 * @return {string} El identificador de la transacción
*/
generateId: () => string;

/**
 * Calcula el hash de la transacción teniendo en cuenta todos sus atributos.
 * @return {string} El hash de la transacción
*/
calculateHash: () => string;

/**
 * Comprueba si la transacción es válida y está correctammente
 * formada (la firma es correcta, tiene todos los atributos, etc.)
 * @return {boolean} 'true' si es válida y 'false' en caso contrario
*/
isValid: () => boolean;

/**
 * Firma la transacción.
 * @param {ec.KeyPair} signPrivateKey Par de claves necesario para firmar
 * la transacción.
 */
signTransaction: (signPrivateKey: ec.KeyPair) => void;
```

- ## Bloque

### Atributos

```typescript
id: string;                     # identificador único
timestamp: number;              # momento en el que se creó el bloque
hash: string;                   # hash del bloque actual
previousHash: string;           # hash del bloque anterior en la cadena de bloques
nonce: number;                  # número de veces que se ha hecho hash al bloque
transactions: ITransaction[];   # transacciones que se han incluido en el bloque
```

### Métodos

```typescript
/**
 * Genera un identificador único al crear un bloque.
 * @return {string} El identificador del bloque
*/
generateId: () => string;

/**
 * Calcula el hash del bloque teniendo en cuenta todos sus atributos.
 * @return {string} El hash del bloque
*/
calculateHash: () => string;

/**
 * Calcula el hash del bloque hasta que éste empiece por tantos ceros '0' como
 * indique el parámetro 'difficulty'. En cada iteración incrementará el nonce
 * en una unidad para que así varíe el resultado del nuevo hash.
 * @param {number} difficulty Difucaltad o número de ceros que debe tener el hash
*/
mine: (difficulty: number) => void;

/**
 * Comprueba que las transacciones que tiene el bloque están perfectamente
 * firmadas por el remitente de la misma, así como que tiene los atributos
 * correspondientes.
 * @return {boolean} 'true' si las transacciones son válidas y 'false' de lo
 * contrario
*/
hasValidTransactions: () => boolean;
```

- ## Blockchain

### Atributos

```typescript
currentNodeUrl: string;                 # Url del nodo actual
chain: IBlock[];                        # copia de la cadena de bloques
pendingTransactions: ITransaction[];    # transacciones que no se han incluido en un bloque
networkNodes: string[];                 # resto de nodos que conforman la red
difficulty: number;                     # dificultad exigida a los mineros
miningReward: number;                   # recompensa por bloque minado
```

### Métodos

```typescript
/**
 * Crea el primer bloque de la cadena de bloques o bloque génesis.
*/
createGenesisBlock: () => void;

/**
 * Mina un nuevo bloque con las transacciones pendientes.
 * @param {string} miningRewardAddress Dirección pública del minero que ha conseguido minar el bloque.
*/
minePendingTransactions: (miningRewardAddress: string) => void;

/**
 * Busca una transacción en la cadena de bloques mediante su identificador.
 * @param {string} id Identificador de la transacción
 * @return {ITransaction | undefined} La transacción o 'undefined' si no se ha encontrado
*/
getTransaction: (id: string) => ITransaction | undefined;

/**
 * Añade una transacción al contenedor de transacciones pendientes.
 * @param {ITransaction} transaction La transacción a añadir.
 * @return {number} La posición dentro del contenedor de transacciones.
*/
addTransaction: (transaction: ITransaction) => number;

/**
 * Añade un bloque a la cadena de bloques.
 * @param {IBlock} block Objeto bloque.
*/
addBlock: (block: IBlock) => void;

/**
 * Busca un bloque dentro de la cadena de bloques mediante su hash.
 * @param {string} hash Hash del bloque a buscar.
 * @return {IBlock | undefined} El bloque o 'undefined' si no se ha encontrado
*/
getBlock: (hash: string) => IBlock | undefined;

/**
 * Obtiene el último bloque añadido o minado en la cadena de bloques.
 * @return {IBlock} El último bloque
*/
getLatestBlock: () => IBlock;

/**
 * Obtiene el saldo actual de una dirección.
 * @param {string} address Dirección a buscar
 * @return {number} Saldo de la dirección
*/
getBalanceOfAddress: (address: string) => number;

/**
 * Comprueba si la cadena de bloques es válida.
 * @param {IBlock[]} chain Cadena de bloques a comprobar.
 * @return {boolean} 'true' si la cadena es válida y 'false' de lo contrario
*/
isChainValid: (chain: IBlock[]) => boolean;
```

## Rutas de la API

## **Obtener la blockchain**

_Devuelve la copia de la cadena de bloques que el nodo que recibe la petición._

- **URL**

  `/blockchain`

- **Método:**

  `GET`

- **Respuesta con éxito:**

  - **Código:** 200
  - **Contenido:**
    ```json
    {
      "currentNodeUrl": "http://localhost:3000",
      "chain": [
        {
          "id": "0",
          "timestamp": 1586967497007,
          "previousHash": "0",
          "nonce": 0,
          "transactions": [],
          "hash": "7dbd505d358dca188c333293495cb45b220b1993eba0248cd82c16672d5954df"
        }
      ],
      "pendingTransactions": [],
      "networkNodes": [],
      "miningReward": 12.5,
      "difficulty": 4
    }
    ```

- **Ejemplo de petición (usando axios):**

  ```typescript
  (async () => {
    try {
      const response = await axios.get(`${ROOT_URL}/blockchain`);
      const blockchain = response.data;
      console.log(blockchain);
    } catch (error) {
      console.error(error.message);
    }
  })();
  ```

---

## **Obtener una transacción**

_Devuelve una transacción de la cadena de bloques si existe._

- **URL**

  `/transaction/:transactionId`

- **Método:**

  `GET`

- **Respuesta con éxito:**

  - **Código:** 200
    **Contenido:**
    ```json
    {
      "id": "2feb5e3083cd11eaa13d5173deda1f20",
      "fromAddress": "0430de2780299a76a062634c32bf2738d56b808f497750c9f9cd18a30ef4a09f57b95f78274fe2c8ae82e64bd800b8e3d4998eca6b4815a95444854549080862aa",
      "toAddress": "0430de2780299a76a062634c32bf2738d56b808f497750c9f9cd18a30ef4a09f57b95f78274fe2c8ae82e64bd800b8e3d4998eca6b4815a95444854549080862a",
      "amount": 10,
      "signature": "304502205c65b8b77e7ee7b68336b9fb6fd092215e3bcfff79b5503841a22475b67869a8022100d818b8204dda6ba39583ca812536d12e50635ea16bf2a8c74a9ae792fb02c816"
    }
    ```

- **Ejemplo de petición (usando axios):**

  ```typescript
  (async () => {
    try {
      const response = await axios.get(
        `${ROOT_URL}/transaction/${transactionId}`
      );
      const transaction = response.data;
      console.log(transaction);
    } catch (error) {
      console.error(error.message);
    }
  })();
  ```

---

## **Obtener un bloque**

_Devuelve un bloque de la cadena de bloques si existe._

- **URL**

  `/block/:blockHash`

- **Método:**

  `GET`

- **Respuesta con éxito:**

  - **Código:** 200
    **Contenido:**
    ```json
    {
      "id": "4512412083cd11ea87dc7be01b243e32",
      "timestamp": 1587472823858,
      "previousHash": "7dbd505d358dca188c333293495cb45b220b1993eba0248cd82c16672d5954df",
      "nonce": 146993,
      "transactions": [
        {
          "id": "2feb5e3083cd11eaa13d5173deda1f20",
          "fromAddress": "0430de2780299a76a062634c32bf2738d56b808f497750c9f9cd18a30ef4a09f57b95f78274fe2c8ae82e64bd800b8e3d4998eca6b4815a95444854549080862aa",
          "toAddress": "0430de2780299a76a062634c32bf2738d56b808f497750c9f9cd18a30ef4a09f57b95f78274fe2c8ae82e64bd800b8e3d4998eca6b4815a95444854549080862a",
          "amount": 10,
          "signature": "304502205c65b8b77e7ee7b68336b9fb6fd092215e3bcfff79b5503841a22475b67869a8022100d818b8204dda6ba39583ca812536d12e50635ea16bf2a8c74a9ae792fb02c816"
        }
      ],
      "hash": "0000d6af0fb8d7478c71dbd21c56ab693880eab882a9516b1fe02e6ad2b1babb"
    }
    ```

- **Ejemplo de petición (usando axios):**

  ```typescript
  (async () => {
    try {
      const response = await axios.get(`${ROOT_URL}/block/${blockHash}`);
      const block = response.data;
      console.log(block);
    } catch (error) {
      console.error(error.message);
    }
  })();
  ```

---

## **Obtener el saldo de una dirección**

_Devuelve el saldo dada una dirección._

- **URL**

  `/address/:address`

- **Método:**

  `GET`

- **Respuesta con éxito:**

  - **Código:** 200
    **Contenido:**
    ```json
    { "balance": 10 }
    ```

- **Ejemplo de petición (usando axios):**

  ```typescript
  (async () => {
    try {
      const response = await axios.get(`${ROOT_URL}/address/${address}`);
      const balance = response.data.balance;
      console.log(balance);
    } catch (error) {
      console.error(error.message);
    }
  })();
  ```

## **Enviar una transacción**

_Envía una transacción a la blockchain._

- **URL**

  `/transaction/broadcast`

- **Método:**

  `POST`

- **Respuesta con éxito:**

  - **Código:** 200
    **Contenido:**

    ```json

    ```

- **Ejemplo de petición (usando axios):**

  ```typescript
  ```

## **Minar el siguiente bloque**

_Comienza a ejecutar el algoritmo de minado del nodo al que se envía la petición._

- **URL**

  `/mine`

- **Método:**

  `GET`

- **Respuesta con éxito:**

  - **Código:** 200
  - **Contenido:**
    ```json
    {
      "message": "New block mined successfully.",
      "block": {
        "id": "d8e8bf70847a11eaad0f73f87b355545",
        "timestamp": 1587547374824,
        "previousHash": "7dbd505d358dca188c333293495cb45b220b1993eba0248cd82c16672d5954df",
        "nonce": 12711,
        "transactions": [],
        "hash": "00009ff37a4be3edd5df67615a0e55cc00801301ec29003ddffb705a0c1ffecb"
      }
    }
    ```

- **Ejemplo de petición (usando axios):**

  ```typescript
  (async () => {
    try {
      const response = await axios.get(`${ROOT_URL}/mine`);
      const newBlock = response.data;
      console.log(newBlock);
    } catch (error) {
      console.error(error.message);
    }
  })();
  ```

## **Realizar el algoritmo de consenso**

_Ejecuta el algoritmo de consenso en el nodo que recibe la petición._

- **URL**

  `/consensus`

- **Método:**

  `GET`

- **Respuesta con éxito:**

  - **Código:** 200
    **Contenido:**
    ```json

    ```

- **Ejemplo de petición (usando axios):**

  ```typescript
  (async () => {
    try {
      const response = await axios.get(`${ROOT_URL}/consensus`);
      const result = response.data;
      console.log(result);
    } catch (error) {
      console.error(error.message);
    }
  })();
  ```

## Controlador

[FALTA]

## Librerías utilizadas

- ## **express**
  - Descripción:
  - Características:
    - Enrutamiento robusto
    - Centrarse en el alto rendimiento
    - Cobertura de prueba súper alta
    - Ayudantes HTTP (redirección, almacenamiento en caché, etc.)
    - Sistema de visualización compatible con más de 14 motores de plantillas
    - Negociación de contenido
    - Ejecutable para generar aplicaciones rápidamente
  - Instalación: `npm install --save express @types/express`
  - Página principal: https://expressjs.com/
- ## **axios**
  - Descripción: Cliente HTTP basado en promesas para el navegador y node.js
  - Características:
    - Hacer XMLHttpRequests desde el navegador
    - Hacer solicitudes http desde node.js
    - Admite la API Promise
    - Solicitud de intercepción y respuesta
    - Transformar datos de solicitud y respuesta
    - Cancelar solicitudes
    - Transformaciones automáticas para datos JSON
    - Soporte del lado del cliente para proteger contra XSRF
  - Instalación: `npm install --save axios @types/axios`
  - Página principal: https://github.com/axios/axios
- ## **sha256**
  - Descripción: Componente JavaScript para calcular el SHA256 de cadenas de texto o bytes.
  - Instalación: `npm install --save sha256 @types/sha256`
  - Página principal: https://github.com/cryptocoinjs/sha256
- ## **elliptic**
  - Descripción: Criptografía rápida de curva elíptica en una implementación simple de javascript.
  - Instalación: `npm install --save elliptic @types/elliptic`
  - Página principal: https://github.com/indutny/elliptic
- ## **uuid**
  - Descripción: Para la creación de RFC4122 UUID
  - Instalación: `npm install --save uuid @types/uuid`
  - Página principal: https://github.com/uuidjs/uuid
