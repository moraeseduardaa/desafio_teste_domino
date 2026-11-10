const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const D = require('./domino');

const pc = (l1, l2) => ({ lado1: l1, lado2: l2 });

function baralhoComMaos(maos) {
    const inicio = maos.flat();
    const resto = D.pecas().filter(
        x => !inicio.some(y => y.lado1 === x.lado1 && y.lado2 === x.lado2)
    );
    return [...inicio, ...resto];
}

describe('Preparação da partida', () => {

    test('CT01: dois jogadores com IDs 0 e 1', () => {
        const p = D.criarPartida();

        assert.equal(p.jogadores.length, 2);
        assert.deepEqual(p.jogadores.map(j => j.id), [0, 1]);
    });

    test('CT02: conjunto tem 28 peças sem repetição', () => {
        const lista = D.pecas();

        assert.equal(lista.length, 28);
        assert.equal(new Set(lista.map(x => `${x.lado1}-${x.lado2}`)).size, 28);
    });

    test('CT03: embaralhar preserva as mesmas 28 peças', () => {
        const chaves = lista => lista.map(x => `${x.lado1}-${x.lado2}`).sort();
        const original = D.pecas();

        assert.deepEqual(chaves(D.embaralhar(original)), chaves(original));
    });

    test('CT04: distribuir dá 7 peças a cada jogador e 14 no estoque', () => {
        const p = D.distribuir(D.criarPartida());

        p.jogadores.forEach(j => assert.equal(j.mao.length, 7));
        assert.equal(p.estoque.length, 14);
    });

    test('CT05: baralho com peça repetida é rejeitado', () => {
        const deck = D.pecas();
        deck[1] = deck[0];

        assert.throws(() => D.distribuir(D.criarPartida(), deck), /Baralho inválido/);
    });

});

describe('Peças', () => {

    test('CT06: encaixa retorna true quando um lado coincide com o valor', () => {
        assert.equal(D.encaixa(pc(3, 5), 3), true);
        assert.equal(D.encaixa(pc(3, 5), 5), true);
    });

    test('CT07: encaixa retorna false quando nenhum lado coincide', () => {
        assert.equal(D.encaixa(pc(3, 5), 2), false);
    });

    test('CT08: totalPontos soma os valores de todas as peças na mão', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(1, 2), pc(3, 4), pc(0, 5)];

        assert.equal(D.totalPontos(p, 0), 15);
    });

});

describe('Jogadas', () => {

    test('CT09: não permite jogar fora da vez', () => {
        const p = D.distribuir(D.criarPartida(),
            baralhoComMaos([[pc(3, 5), pc(0, 0), pc(0, 1), pc(0, 2), pc(1, 1), pc(2, 2), pc(2, 4)],
                            [pc(5, 6), pc(0, 3), pc(0, 4), pc(0, 6), pc(1, 6), pc(2, 6), pc(3, 6)]]));

        assert.throws(() => D.jogar(p, 1, pc(5, 6), 'direita'), /Fora da vez/);
    });

    test('CT10: não permite jogar peça que não está na mão', () => {
        const p = D.distribuir(D.criarPartida(),
            baralhoComMaos([[pc(3, 5), pc(0, 0), pc(0, 1), pc(0, 2), pc(1, 1), pc(2, 2), pc(2, 4)],
                            [pc(5, 6), pc(0, 3), pc(0, 4), pc(0, 6), pc(1, 6), pc(2, 6), pc(3, 6)]]));

        assert.throws(() => D.jogar(p, 0, pc(6, 6), 'direita'), /não está na mão/);
    });

    test('CT11: primeira peça define as extremidades da mesa', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(3, 5)];

        D.jogar(p, 0, pc(3, 5), 'direita');

        assert.equal(p.extremidadeEsquerda, 3);
        assert.equal(p.extremidadeDireita, 5);
        assert.equal(p.mesa.length, 1);
    });

    test('CT12: encaixe válido na direita atualiza extremidade direita', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(3, 5), pc(0, 0)]; 
        p.jogadores[1].mao = [pc(5, 6), pc(0, 1)];

        D.jogar(p, 0, pc(3, 5), 'direita');
        D.jogar(p, 1, pc(5, 6), 'direita');

        assert.equal(p.extremidadeDireita, 6);
    });

    test('CT13: encaixe válido na esquerda atualiza extremidade esquerda', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(3, 5), pc(1, 3), pc(0, 0)];
        p.jogadores[1].mao = [pc(5, 6), pc(0, 1)];

        D.jogar(p, 0, pc(3, 5), 'direita'); 
        D.jogar(p, 1, pc(5, 6), 'direita');
        D.jogar(p, 0, pc(1, 3), 'esquerda');

        assert.equal(p.extremidadeEsquerda, 1);
    });

    test('CT14: encaixe inválido na direita é rejeitado', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(3, 5), pc(0, 0)];
        p.jogadores[1].mao = [pc(1, 2), pc(0, 1)];

        D.jogar(p, 0, pc(3, 5), 'direita');

        assert.throws(() => D.jogar(p, 1, pc(1, 2), 'direita'), /não encaixa na direita/);
    });

    test('CT15: encaixe inválido na esquerda é rejeitado', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(3, 5), pc(0, 0)];
        p.jogadores[1].mao = [pc(1, 2), pc(0, 1)];

        D.jogar(p, 0, pc(3, 5), 'direita');

        assert.throws(() => D.jogar(p, 1, pc(1, 2), 'esquerda'), /não encaixa na esquerda/);
    });

    test('CT16: encadeamento de três peças mantém extremidades corretas', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(2, 4), pc(1, 2), pc(0, 0)];
        p.jogadores[1].mao = [pc(4, 6), pc(0, 1)];

        D.jogar(p, 0, pc(2, 4), 'direita');
        D.jogar(p, 1, pc(4, 6), 'direita');
        D.jogar(p, 0, pc(1, 2), 'esquerda');

        assert.equal(p.extremidadeEsquerda, 1);
        assert.equal(p.extremidadeDireita, 6);
        assert.equal(p.mesa.length, 3);
    });

});

describe('Estoque', () => {

    test('CT17: comprar do estoque quando não há peça que encaixe', () => {
        const p = D.criarPartida();
        p.mesa = [pc(1, 2)];
        p.extremidadeEsquerda = 1;
        p.extremidadeDireita = 2;
        p.jogadores[0].mao = [pc(5, 6)];
        p.estoque = [pc(0, 0)];

        const peca = D.comprar(p, 0);

        assert.deepEqual(peca, pc(0, 0));
        assert.equal(p.estoque.length, 0);
        assert.ok(p.jogadores[0].mao.some(x => x.lado1 === 0 && x.lado2 === 0));
    });

    test('CT18: comprar de estoque vazio retorna null quando não há jogada possível', () => {
        const p = D.criarPartida();
        p.mesa = [pc(1, 2)];
        p.extremidadeEsquerda = 1;
        p.extremidadeDireita = 2;
        p.jogadores[0].mao = [pc(5, 6)];
        p.estoque = [];

        assert.equal(D.comprar(p, 0), null);
    });

    test('CT19: podePjogar retorna true em mesa vazia', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(1, 2)];

        assert.equal(D.podePjogar(p, 0), true);
    });

    test('CT20: podePjogar retorna true quando tem peça que encaixa', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(3, 5)];
        p.jogadores[1].mao = [pc(5, 6)];

        D.jogar(p, 0, pc(3, 5), 'direita');

        assert.equal(D.podePjogar(p, 1), true);
    });

    test('CT21: podePjogar retorna false quando nenhuma peça encaixa', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(3, 5)];
        p.jogadores[1].mao = [pc(1, 2)];

        D.jogar(p, 0, pc(3, 5), 'direita');

        assert.equal(D.podePjogar(p, 1), false);
    });

});

describe('Vitória e travamento', () => {

    test('CT22: passar a vez quando não pode jogar e estoque vazio', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(3, 5), pc(0, 0)];
        p.jogadores[1].mao = [pc(1, 2), pc(2, 4)];
        p.estoque = [];

        D.jogar(p, 0, pc(3, 5), 'direita');
        D.passar(p, 1);

        assert.equal(p.vez, 0);
    });

    test('CT23: não pode passar se ainda tem peça que encaixa', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(3, 5), pc(0, 0)];
        p.jogadores[1].mao = [pc(5, 6), pc(0, 1)];
        p.estoque = [];

        D.jogar(p, 0, pc(3, 5), 'direita');

        assert.throws(() => D.passar(p, 1), /há peça que encaixa/);
    });

    test('CT24: jogador vence ao jogar a última peça', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(3, 5)];
        p.jogadores[1].mao = [pc(1, 2)];

        D.jogar(p, 0, pc(3, 5), 'direita');

        assert.equal(p.encerrada, true);
        assert.equal(D.vencedor(p), 0);
    });

    test('CT25: partida encerrada não aceita novas jogadas', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(3, 5)];
        p.jogadores[1].mao = [pc(5, 6)];

        D.jogar(p, 0, pc(3, 5), 'direita');

        assert.throws(() => D.jogar(p, 1, pc(5, 6), 'direita'), /Partida encerrada/);
    });

    test('CT26: jogo travado quando ninguém pode jogar e estoque vazio', () => {
        const p = D.criarPartida();
        p.mesa = [pc(1, 2)];
        p.extremidadeEsquerda = 1;
        p.extremidadeDireita = 2;
        p.jogadores[0].mao = [pc(5, 6)];
        p.jogadores[1].mao = [pc(4, 4)];
        p.estoque = [];

        assert.equal(D.travado(p), true);
    });

    test('CT27: em jogo travado vence quem tem menor soma; empate retorna null', () => {
        const p = D.criarPartida();
        p.mesa = [pc(1, 2)];
        p.extremidadeEsquerda = 1;
        p.extremidadeDireita = 2;
        p.jogadores[0].mao = [pc(5, 6)];
        p.jogadores[1].mao = [pc(4, 4)];
        p.estoque = [];

        assert.equal(D.vencedor(p), 1);

        p.jogadores[0].mao = [pc(4, 4)];
        assert.equal(D.vencedor(p), null);
    });

    test('CT28: partida simulada completa — jogador 0 vence', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [pc(1, 2), pc(2, 3), pc(3, 4)];
        p.jogadores[1].mao = [pc(5, 6), pc(0, 5)];
        p.estoque = [];

        D.jogar(p, 0, pc(1, 2), 'direita');
        D.passar(p, 1);                     
        D.jogar(p, 0, pc(2, 3), 'direita');
        D.passar(p, 1);                
        D.jogar(p, 0, pc(3, 4), 'direita');

        assert.equal(p.encerrada, true);
        assert.equal(D.vencedor(p), 0);
        assert.equal(p.mesa.length, 3);
    });

});


describe('Validações adicionais', () => {

    test('CT29: rejeita baralho com valores fora do intervalo de 0 a 6', () => {
        const deck = D.pecas();
        deck[0] = pc(0, 7);

        assert.throws(() => D.distribuir(D.criarPartida(), deck), /Baralho inválido/);
    });

    test('CT30: rejeita peça com os lados em ordem inválida', () => {
        const deck = D.pecas();
        deck[0] = pc(1, 0);

        assert.throws(() => D.distribuir(D.criarPartida(), deck), /Baralho inválido/);
    });

    test('CT31: rejeita compra fora da vez', () => {
        const p = D.criarPartida();
        p.mesa = [pc(1, 2)];
        p.extremidadeEsquerda = 1;
        p.extremidadeDireita = 2;
        p.jogadores[1].mao = [pc(5, 6)];
        p.estoque = [pc(0, 0)];

        assert.throws(() => D.comprar(p, 1), /Fora da vez/);
    });

    test('CT32: rejeita compra quando o jogador já tem peça que encaixa', () => {
        const p = D.criarPartida();
        p.mesa = [pc(1, 2)];
        p.extremidadeEsquerda = 1;
        p.extremidadeDireita = 2;
        p.jogadores[0].mao = [pc(2, 5)];
        p.estoque = [pc(0, 0)];

        assert.throws(() => D.comprar(p, 0), /há peça que encaixa/);
        assert.equal(p.estoque.length, 1);
    });

    test('CT33: rejeita compra após o encerramento da partida', () => {
        const p = D.criarPartida();
        p.encerrada = true;
        p.vencedorId = 0;
        p.estoque = [pc(0, 0)];

        assert.throws(() => D.comprar(p, 0), /Partida encerrada/);
    });

    test('CT34: jogador sem peças não pode jogar na mesa vazia', () => {
        const p = D.criarPartida();
        p.jogadores[0].mao = [];

        assert.equal(D.podePjogar(p, 0), false);
    });

});
