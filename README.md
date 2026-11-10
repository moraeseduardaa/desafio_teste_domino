# Dominó para 2 Jogadores

Implementação das regras de uma partida de Dominó tradicional para 2 jogadores em JavaScript, com casos de teste automatizados utilizando o test runner nativo do Node.js (`node:test`).

## Como rodar

Requisito: Node.js 18.15.0 ou superior. Não é necessário instalar dependências.

```bash
npm test
```

Alternativamente:

```bash
node --test domino.test.js
```

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `domino.js` | Implementação das regras e controle da partida |
| `domino.test.js` | Casos de teste automatizados (CT01 a CT34) |
| `package.json` | Configuração do projeto e comando de testes |

---

## Regras do jogo

### Jogadores

- A partida é disputada por **2 jogadores**, identificados pelos IDs 0 e 1.
- O jogador 0 começa a partida.

### Conjunto de peças

- O jogo utiliza **28 peças**, com combinações dos valores de 0 a 6.
- Cada combinação aparece uma única vez, incluindo as peças duplas.
- Peças com valores fora do intervalo de 0 a 6, repetidas ou em formato inválido são rejeitadas na distribuição.

### Distribuição

- Cada jogador recebe **7 peças**.
- As **14 peças restantes** formam o estoque.
- O jogador 0 inicia a partida.

### Jogadas

- Os jogadores devem respeitar a ordem da vez.
- Só é possível jogar uma peça que esteja na própria mão.
- A primeira peça colocada na mesa define as extremidades esquerda e direita.
- As peças seguintes devem encaixar em uma das extremidades da mesa.
- Uma jogada inválida não deve alterar a mão, a mesa ou a vez dos jogadores.

### Compra e passagem

- Quando não possui peça que encaixe, o jogador deve comprar do estoque.
- A compra só pode ser realizada pelo jogador da vez e enquanto a partida estiver ativa.
- Não é permitido comprar se o jogador já possuir uma peça que encaixe na mesa.
- Se o estoque estiver vazio e o jogador não puder jogar, ele pode passar a vez.

### Vitória e travamento

- Vence quem jogar todas as peças da própria mão primeiro.
- Se ninguém puder jogar e o estoque estiver vazio, a partida está travada.
- Em caso de travamento, vence quem tiver a menor soma dos valores das peças restantes na mão.
- Se houver empate na soma, não há vencedor.

---

## Casos de teste

Os testes verificam a preparação da partida, a validação do conjunto de peças, as jogadas, o funcionamento do estoque, a compra, a passagem de vez, a vitória e o travamento. Cada caso é executado automaticamente pelo comando `npm test`.

### Preparação da partida

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT01 | Criar partida | Dois jogadores com IDs 0 e 1 |
| CT02 | Validar conjunto | 28 peças sem repetição |
| CT03 | Embaralhar | Preserva as mesmas 28 peças |
| CT04 | Distribuir | 7 peças por jogador e 14 no estoque |
| CT05 | Peça repetida no baralho | Distribuição rejeitada |

### Peças

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT06 | Encaixe verdadeiro | Retorna true quando um lado coincide |
| CT07 | Encaixe falso | Retorna false quando nenhum lado coincide |
| CT08 | Total de pontos | Soma os valores das peças da mão |

### Jogadas

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT09 | Jogar fora da vez | Jogada rejeitada |
| CT10 | Jogar peça que não está na mão | Jogada rejeitada |
| CT11 | Primeira peça | Define as extremidades da mesa |
| CT12 | Encaixe válido na direita | Extremidade direita atualizada |
| CT13 | Encaixe válido na esquerda | Extremidade esquerda atualizada |
| CT14 | Encaixe inválido na direita | Jogada rejeitada |
| CT15 | Encaixe inválido na esquerda | Jogada rejeitada |
| CT16 | Encadeamento de três peças | Extremidades corretas após as jogadas |

### Estoque e possibilidade de jogar

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT17 | Comprar sem peça que encaixe | Peça entregue e estoque reduzido em 1 |
| CT18 | Estoque vazio e sem jogada possível | Compra retorna null |
| CT19 | Mesa vazia com peças na mão | `podePjogar` retorna true |
| CT20 | Peça que encaixa disponível | `podePjogar` retorna true |
| CT21 | Nenhuma peça encaixa | `podePjogar` retorna false |

### Vitória e travamento

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT22 | Passar a vez | Permitido quando não pode jogar e o estoque está vazio |
| CT23 | Passar com peça disponível | Passagem rejeitada |
| CT24 | Última peça jogada | Partida encerrada e vencedor definido |
| CT25 | Partida encerrada | Novas jogadas rejeitadas |
| CT26 | Jogo travado | Detectado quando ninguém pode jogar e o estoque está vazio |
| CT27 | Vencedor no travamento | Menor soma vence; empate retorna null |
| CT28 | Partida completa simulada | Jogador 0 vence ao esvaziar a mão |

### Validações adicionais

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT29 | Valores fora do intervalo | Baralho rejeitado |
| CT30 | Peça com lados em ordem inválida | Baralho rejeitado |
| CT31 | Comprar fora da vez | Compra rejeitada |
| CT32 | Comprar tendo peça que encaixa | Compra rejeitada sem alterar o estoque |
| CT33 | Comprar após encerramento | Compra rejeitada |
| CT34 | Mão vazia com mesa vazia | `podePjogar` retorna false |

---

## Colaboradores

NOME: EDUARDA PEREIRA DE MORAES
RA: 24170522-2
