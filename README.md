# Desembaralhe a Nuvem

Jogo em que o jogador recebe as palavras de uma frase embaralhadas, em formato de nuvem, e precisa digitar a frase na ordem correta. Projeto 1 da disciplina **Programação Web Fullstack** (UTFPR, TADS), com foco na camada frontend usando React.js e AJAX.

- **Autor:** Gustavo Taborda Medeiros
- **Repositório:** https://github.com/Gustavo-Taborda/Projeto_ReactJS/
- **Demonstração (opcional):** https://gustavo-taborda.github.io/Project-ReactJS-demo/

## Como o jogo funciona

1. O jogador escolhe uma **dificuldade** e clica em **Gerar nuvem**.
2. Uma frase é sorteada e suas palavras aparecem embaralhadas na nuvem.
3. O jogador digita a frase na barra de resposta. O chat informa se acertou ou errou.
4. Ao acertar, aparecem o número de tentativas, os pontos ganhos e o autor da frase.

### Dificuldades

A dificuldade é definida pela quantidade de caracteres da frase.

| Dificuldade | Caracteres | Pontos base |
|-------------|-----------|-------------|
| Fácil       | até 60    | 10          |
| Médio       | 61 a 100  | 20          |
| Difícil     | 101 ou mais | 30        |

### Pontuação e sequência

- Cada tentativa extra na mesma frase desconta 5 pontos do acerto, com mínimo de 5 pontos.
- **Pontos** ficam no canto superior direito e **Sequência** (streak) no canto superior esquerdo.
- Qualquer resposta errada zera a sequência. Cada acerto soma 1.
- Depois de acertar, a barra de resposta fica bloqueada até gerar uma nova nuvem.
- O chat exibe no máximo as 3 últimas mensagens.

A comparação ignora maiúsculas, minúsculas e pontuação.

## Requisitos da disciplina

| Requisito | Escolha |
|-----------|---------|
| API JSON aberta | [DummyJSON](https://dummyjson.com/docs/quotes) (endpoint de citações) |
| Hook do React | `useReducer`, que concentra todo o estado do jogo (também usa `useRef`) |
| Biblioteca externa | [MUI (Material UI)](https://mui.com/material-ui/) |
| SPA com AJAX | Página única; as frases são buscadas com `fetch` |

### Uso da API

O jogo faz uma requisição `GET https://dummyjson.com/quotes?limit=0`, que retorna todas as citações com os campos `id`, `quote` e `author`. O resultado fica guardado em memória (`useRef`), então a API é chamada só uma vez por sessão. As frases são filtradas pela faixa de caracteres da dificuldade e sorteadas no cliente. As frases da API são em inglês.

## Tecnologias

- React.js
- Vite
- MUI (`@mui/material`, `@emotion/react`, `@emotion/styled`)
- DummyJSON

## Como rodar

Pré-requisito: Node.js 18 ou superior.

```bash
git clone https://github.com/Gustavo-Taborda/Projeto_ReactJS/
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente `http://localhost:5173`).

## Estrutura

```
src/
  App.jsx          # renderiza o jogo
  JogoNuvem.jsx    # componente principal, reducer e telas
```

## Uso de ferramentas de apoio (IA)

Conforme exigido pela disciplina, registro o uso de ferramentas de apoio:

- **Ferramenta:** Claude (Anthropic), em conversa na interface web.
- **Para que foi usada:**
  - sugestão de APIs JSON abertas para o jogo;
  - rascunho inicial do componente `JogoNuvem.jsx` (layout estilo chat, `reducer`, com o MUI);
  - Guia para integração com DummyJSON para o jogo;
  - proposta das regras de pontuação, tentativas e sequência;
  - README.
  - Guia para publicar a página
