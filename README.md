# Atlas BI — Business Intelligence & Management

[**Acessar demonstração interativa**](https://allansantos61.github.io/atlas-bi-platform/) · [**Portfólio profissional**](https://allansantos61.github.io/)

> Projeto demonstrativo independente, com dados sintéticos, para apresentar competências em análise de negócios, indicadores, desenvolvimento front-end e visualização de dados. **Não é uma cópia de um sistema de cliente.**

## Contexto e problema

Equipes que acompanham projetos, clientes, tarefas e receitas em controles separados têm dificuldade para consolidar indicadores e identificar o andamento das operações. O Atlas BI reúne essas dimensões em uma interface única para fins de demonstração.

## Solução e recursos

| Área | Funcionalidade |
| --- | --- |
| Visão executiva | Total de projetos, assinados, receita potencial, recebidos, progresso da meta, receita por projeto e composição por status |
| Projetos | Cadastro, edição em formulário, exclusão e filtro por ano e responsável |
| Tarefas | Cadastro, edição de status e exclusão |
| Clientes | Cadastro, edição e exclusão |
| Financeiro | Receita potencial, recebida, valores de projetos assinados e comparação por ano do projeto |
| Metas | Meta demonstrativa editável, percentual atingido e saldo restante |

### Regras de negócio dos indicadores

- **Receita potencial:** soma do campo `valor` de todos os projetos selecionados, independentemente do status. É uma projeção demonstrativa, não receita reconhecida.
- **Recebido:** soma do campo `valor` apenas de projetos cujo status é `Recebido`.
- **A receber:** soma do campo `valor` apenas de projetos com status `Assinado`. Não é uma conta a receber contábil.
- **Meta atingida:** `recebido / meta × 100`. O indicador considera o filtro ativo de ano e responsável, enquanto a meta é um valor único configurável.
- **Restante:** `max(0, meta - recebido)`.
- **Gráfico de distribuição:** participação percentual do valor dos projetos em cada status, respeitando os filtros.
- **Comparação financeira por ano:** agrupamento pelo campo `ano` do projeto, **não** por data de pagamento. Com o filtro de um único ano, mostra apenas aquele ano.

Essas definições são deliberadamente simples e **não substituem** uma modelagem contábil ou financeira real.

## Arquitetura atual

```text
GitHub Pages (hospedagem estática)
├── index.html        Interface, dados fictícios e lógica da demonstração
├── enhancements.js   Formulários de edição, visualizações e ações adicionais
└── localStorage      Persistência isolada no navegador do visitante
```

**Stack implementada:** HTML5, CSS3, JavaScript, GitHub Pages e localStorage. React, TypeScript e Supabase são possibilidades futuras, **não tecnologias utilizadas nesta versão**.

## Executar localmente

1. Clone o repositório ou baixe o código.
2. Abra `index.html` em um navegador moderno.
3. Para restaurar a base fictícia, use o botão **Restaurar dados fictícios**.

Não requer servidor nem credenciais. Alterações feitas no navegador **não são sincronizadas entre dispositivos**.

## Limitações conhecidas

- Sem autenticação, controle de acesso, API ou banco de dados.
- Dados sintéticos e armazenamento local; não usar com informações reais ou sensíveis.
- Sem datas de transações: não há série temporal mensal confiável.
- A meta é única; não existe cadastro de metas por ano/responsável.
- Os dados não representam resultados reais de uma empresa.
- A demonstração não possui testes automatizados nesta versão.

## Próximos passos técnicos

1. Refatorar a aplicação em componentes com React e TypeScript.
2. Criar esquema PostgreSQL com Supabase, autenticação e políticas RLS.
3. Modelar histórico de status, datas de assinatura/recebimento e metas por período.
4. Criar testes unitários de KPIs e testes de interface.
5. Implementar filtros, estados vazios, acessibilidade e exportação de dados.

## Autoria

Projeto de portfólio de [Allan Santos](https://github.com/AllanSantos61). Código e dados deste repositório são independentes de sistemas privados de clientes.
