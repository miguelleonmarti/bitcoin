# Blockchain en Node.js

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
3. [Modelos](#modelos)
   - [Modelo de transacción](#modelo-de-transacción)
   - [Modelo de bloque](#modelo-de-bloque)
   - [Modelo de blockchain](#modelo-de-blockchain)
4. [Prueba de trabajo](#prueba-de-trabajo)
5. [Algoritmo de consenso](#algoritmo-de-consenso)
6. [Rutas de la API](#rutas-de-la-api)
   - [Obtener la blockchain](#obtener-la-blockchain)
   - [Obtener un bloque](#obtener-un-bloque)
   - [Obtener una transacción](#obtener-una-transacción)
   - [Obtener el saldo de una dirección](#obtener-el-saldo-de-una-dirección)
   - [Enviar una transacción](#enviar-una-transacción)
   - [Minar el siguiente bloque](#minar-el-siguiente-bloque)
   - [Realizar el algoritmo de consenso](#realizar-el-algoritmo-de-consenso)
7. [Controlador](#controlador)
8. [Librerías utilizadas](#librerías-utilizadas)
   - [express](#express)
   - [axios](#axios)
   - [sha256](#sha256)
   - [elliptic](#elliptic)
   - [uuid](#uuid)
9. [Setup del proyecto](#setup-del-proyecto)

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

## Modelos

---
- ## Modelo de transacción
---

La clase `Transaction` implementa la interfaz `ITransaction`:

```ts
export default class Transaction implements ITransaction {...}
```

### Constructor

```typescript
 constructor(fromAddress: string, toAddress: string, amount: number) {
    this.id = this.generateId();
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
```

### Métodos

```ts
generateId(): string {
  return uuid()
    .split("-") // Se eliminan los guiones del identificador generado 
    .join(""); // por la librería 'uuid'
}
```

```ts
signTransaction(signPrivateKey: ec.KeyPair): void {
  if (signPrivateKey.getPublic("hex") !== this.fromAddress) {
    // Si la firma no coincide con la dirección del remitente de
    // la transacción se lanza una excepción
    throw new Error("You cannot sign transactions for other wallets!");
  }

  // Se calcula el hash de la transacción ...
  const transactionHash = this.calculateHash();
  // y se firma la transacción
  this.signature = signPrivateKey.sign(transactionHash, "base64").toDER("hex");
}
```

```ts
calculateHash(): string {
  // Utilizando la librería 'sha256' calculamos el hash de la
  // transacción agrupando todos sus atributos en una cadena
  // de caracteres única
  return sha256(
    this.id + this.fromAddress + this.toAddress + this.amount
  ).toString();
}
```

```ts
isValid(): boolean {
  // No es válida si no tiene la dirección del remitente
  if (!this.fromAddress) return false;
  // Tampoco es válida si no está firmada
  if (!this.signature || this.signature.length === 0) return false;

  // Y para comprobar que está firmada correctamente utilizamos
  // el algoritmo de curva elíptica y el hash de la transacción
  const publicKey = ellipticCurve.keyFromPublic(this.fromAddress, "hex");
  return publicKey.verify(this.calculateHash(), this.signature);
}
```

---
- ## Modelo de bloque
---
### Constructor

```ts
constructor(transactions: ITransaction[], previousHash: string = "") {
  this.id = this.generateId();
  this.timestamp = Date.now(); // Se genera el identificador al crear la transacción
  this.previousHash = previousHash;
  this.nonce = 0; // Al no haber sido minado todavía, el nonce se inicializa a 0.
  this.transactions = transactions;
  this.hash = this.calculateHash();
}
```

### Métodos

```ts
calculateHash(): string {
  // Utilizando la librería 'sha256' calculamos el hash de la
  // transacción agrupando todos sus atributos en una cadena
  // de caracteres única
  return sha256(
    this.id +
      this.timestamp +
      this.previousHash +
      this.nonce +
      JSON.stringify(this.transactions) // Hay que transformar el array a string
  ).toString();
}
```

```ts
mine(difficulty: number): void {
  // Mientras el hash del bloque no comience por tantos ceros
  // como especifique la dificultad (si la dificultad es 5, 
  // el hash correcto deberá empezar así: "00000"), se volverá
  // a realizar el hash del bloque aumnetando el nonce, lo que
  // hará que se modifique el resultado de la operación de hash.
  // Así tantas veces como sea necesario. Por eso se trata de
  // "algoritmo de fuerza bruta" que exige una gran capacidad
  // de computación
  while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
    this.nonce++;
    this.hash = this.calculateHash();
  }
}
```

```ts
hasValidTransactions(): boolean {
  // Recorre las transacciones del bloque comprobando
  // una a una que son válidas
  for (const transaction of this.transactions) {
    if (!transaction.isValid()) {
      return false;
    }
  }

  return true;
}
```
---
- ## Modelo de blockchain
---

### Constructor

```ts
constructor() {
  // Al desplegar el servidor en Heroku, declaro una variable
  // de entorno llamada URL que coincide con la dirección URL
  // raíz del nodo (se declara en Heroku). No obstante, si
  // se quisiera ejecutar la aplicación en local lo recomendable
  // sería ejecutar el programa desde la consola pasándole esta
  // variable como parámetro. De este modo quedaría algo así:

  // this.currentNodeUrl = `${process.args[2]}`
  // si es que ejecutamos `node run app https:localhost:3000`

  this.currentNodeUrl = `${process.env.URL}`;
  this.chain = [this.createGenesisBlock()];
  this.pendingTransactions = [];
  this.networkNodes = [];
  this.miningReward = 12.5;
  this.difficulty = 5; 
}
```

### Métodos

```ts
createGenesisBlock(): IBlock {
  const genesisBlock: IBlock = new Block([], "0");
  // Se fija una fecha para el bloque génesis
  // De lo contrario cada nodo crearía su propio bloque
  // génesis en instantes distintos.
  genesisBlock.timestamp = 1586967497007;
  genesisBlock.id = "0";
  genesisBlock.hash = genesisBlock.calculateHash();
  return genesisBlock;
}
```

```ts
addTransaction(transaction: ITransaction): number {
  // No se puede añadir una transacción que no carezca
  // de dirección de remitente y receptor
  if (!transaction.fromAddress || !transaction.toAddress) {
    throw new Error("Transaction must include fromAddress and toAddress");
  }

  // Si la transacción no es válida no se añadirá al
  // contenedor de transacciones pendientes
  if (!transaction.isValid() && transaction.fromAddress !== "0") {
    throw new Error("Cannot add invalid transaction to chain");
  }

  const transactionCopy = Object.assign({}, transaction);

  return this.pendingTransactions.push(transactionCopy);
}
```

```ts
minePendingTransactions(miningRewardAddress: string): void {
  // Se crea el nuevo bloque y se le añaden
  // las transacciones pendientes y se enlaza
  // con el último bloque minado mediante el
  // hash de éste
  const block = new Block(
    this.pendingTransactions,
    this.getLatestBlock().hash
  );

  // Se mina el bloque
  block.mine(this.difficulty);

  // Una vez minado se une a la cadena de bloques
  this.chain.push(Object.assign({}, block));

  // Y se vacía el array de transacciones pendientes
  this.pendingTransactions = [];
}
```

```ts
getLatestBlock(): IBlock {
  return this.chain[this.chain.length - 1];
}
```

```ts
isChainValid(chain: IBlock[]): boolean {
  const length: number = chain.length;
  for (let i = 1; i < length; i++) {
    const currentBlock: IBlock = chain[i];
    const previousBlock: IBlock = chain[i - 1];

    // La cadena no es válida si uno de los bloques contiene
    // transacciones no válidas
    if (!currentBlock.hasValidTransactions()) {
      return false;
    }

    // La cadena no es corecta si al realizar el hash de uno
    // de los bloques, este resultado no coincide con el hash
    // que tiene como atributo
    if (currentBlock.hash != currentBlock.calculateHash()) {
      return false;
    }

    // La cadena no es válida si los bloques no están "encadenados"
    // correctamente. El bloque actual debe tener el hash del anterior
    // bloque como referencia
    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }
  }

  return true;
}
```

```ts
getBalanceOfAddress(address: string): number {
  let balance = 0;

  for (const block of this.chain) {
    for (const transaction of block.transactions) {
      // Si la dirección es la que envía la transacción
      // la cantidad enviada supondrá un balance negativo
      if (transaction.fromAddress === address) {
        balance -= transaction.amount;
      }

      // Si la dirección es la que envía la transacción
      // la cantidad enviada supondrá un balance positivo
      if (transaction.toAddress === address) {
        balance += transaction.amount;
      }
    }
  }

  // Si la dirección nunca ha aparecido en
  // una transacción el resultado será de 0.
  return balance;
}
```

```ts
getBlock(hash: string): IBlock | undefined {
  return this.chain.find((block: IBlock) => block.hash === hash);
}
```

```ts
getTransaction(id: string): ITransaction | undefined {
  for (const block of this.chain) {
    const t = block.transactions.find(transaction => transaction.id === id)
    if (t) return t;
  }

  return undefined;
}
```

## Prueba de trabajo

`block.model.ts`

```typescript
mine(difficulty: number): void {
  while (
    this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
  ) {
    this.nonce++;
    this.hash = this.calculateHash();
  }
}
```

## Algoritmo de consenso

```typescript
export const consensus = async (req: Request, res: Response) => {
  const promises: Promise<AxiosResponse<any>>[] = [];

  bitcoin.networkNodes.forEach((networkNodeUrl: string) => {
    promises.push(axios.get(`${networkNodeUrl}/blockchain`));
  });

  try {
    const blockchains = await Promise.all(promises);

    const currentChainLenght = bitcoin.chain.length;
    let maxChainLength = currentChainLenght;
    let newLongestChain = null;
    let newPendingTransactions = null;

    blockchains.forEach((blockchain: any) => {
      blockchain = JSON.parse(blockchain);
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });

    if (
      !newLongestChain ||
      (newLongestChain && !bitcoin.isChainValid(newLongestChain))
    ) {
      return res.json({
        message: "Current chain has not been replaced.",
        chain: bitcoin.chain
      });
    } else {
      bitcoin.chain = newLongestChain;
      if (newPendingTransactions) {
        bitcoin.pendingTransactions = newPendingTransactions;
      }
      return res.json({
        message: "This chain has been replaced",
        chain: bitcoin.chain
      });
    }
  } catch (error) {
    return res.status(500).send({ error: error });
  }
};
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
  - **Contenido:**
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
  - **Contenido:**
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
  - **Contenido:**
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
  - **Contenido:**

    ```json

    ```

- **Ejemplo de petición (usando axios):**

  ```typescript
  (async () => {
    try {
      const data = {
        id: transaction.id,
        fromAddress: transaction.fromAddress,
        toAddress: transaction.toAddress,
        amount: transaction.amount,
        signature: transaction.signature
      };
      const response = await axios.post(
        `${ROOT_URL}/transaction/broadcast`,
        data
      );
      const result = response.data;
      console.log(result);
    } catch (error) {
      console.error(error.message);
    }
  })();
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
  - **Contenido:**

    ```json
    {
      "message": "Current chain has not been replaced.",
      "chain": [
        {
          "id": "0",
          "timestamp": 1586967497007,
          "previousHash": "0",
          "nonce": 0,
          "transactions": [],
          "hash": "7dbd505d358dca188c333293495cb45b220b1993eba0248cd82c16672d5954df"
        }
      ]
    }
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

## Setup del proyecto

### Requisitos: tener instalado Node.js y git.

1. Clonar el repositorio:

   `git clone https://github.com/miguelleonmarti/bitcoin.git`

2. Instalar las dependecias:

   `npm install`

3. Transpilar el proyecto:

   `npm run tsc`

4. Ejecutar los nodos (en consolas o terminales distintos):

   `npm run node0`

   `npm run node1`

   `npm run node2`
