-- ==========================================
-- BANCO DE DADOS - PIM OFICIAL
-- SISTEMA DE GERENCIAMENTO DE ESTOQUE
-- ==========================================

CREATE DATABASE PIM_Oficina_Estoque;

USE PIM_Oficina_Estoque;


-- ==========================================
-- 1. USUÁRIO
-- ==========================================

CREATE TABLE usuario (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT GETDATE(),
    ativo BIT NOT NULL DEFAULT 1
);

-- ==========================================
-- 2. CATEGORIA
-- ==========================================

CREATE TABLE categoria (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    descricao VARCHAR(200)
);

-- ==========================================
-- 3. FORNECEDOR
-- ==========================================

CREATE TABLE fornecedor (
    id_fornecedor INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(11),
    email VARCHAR(120),
    CNPJ VARCHAR(14),
    tipo VARCHAR(20) NOT NULL DEFAULT 'Nacional',
    cidade VARCHAR(100),
    uf VARCHAR(2),
    observacao VARCHAR(500),
);    

-- ==========================================
-- 4. PRODUTO
-- ==========================================

CREATE TABLE produto (
    id_produto INT IDENTITY(1,1) PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_fornecedor INT NULL,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    descricao VARCHAR(250),
    preco_custo DECIMAL(10,2) NOT NULL,
    preco_venda DECIMAL(10,2) NOT NULL,
    ativo BIT NOT NULL DEFAULT 1,

    CONSTRAINT fk_produto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria),

    CONSTRAINT fk_produto_fornecedor
        FOREIGN KEY (id_fornecedor)
        REFERENCES fornecedor(id_fornecedor),

    CONSTRAINT ck_preco_custo
        CHECK (preco_custo >= 0),

    CONSTRAINT ck_preco_venda
        CHECK (preco_venda >= 0)
);

-- ==========================================
-- 5. ESTOQUE
-- ==========================================

CREATE TABLE estoque (
    id_estoque INT IDENTITY(1,1) PRIMARY KEY,
    id_produto INT NOT NULL UNIQUE,
    quantidade_atual INT NOT NULL DEFAULT 0,
    quantidade_min INT NOT NULL DEFAULT 5,

    CONSTRAINT fk_estoque_produto
        FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto),

    CONSTRAINT ck_quantidade_atual
        CHECK (quantidade_atual >= 0),

    CONSTRAINT ck_quantidade_min
        CHECK (quantidade_min >= 0)
);

-- ==========================================
-- 6. VENDA
-- ==========================================

CREATE TABLE venda (
    id_venda INT IDENTITY(1,1) PRIMARY KEY,
    data_venda DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(15) NOT NULL DEFAULT 'concluida',

    CONSTRAINT ck_status_venda
        CHECK (status IN ('concluida', 'cancelada')),

    CONSTRAINT ck_valor_total
        CHECK (valor_total >= 0)
);

-- ==========================================
-- 7. ITEM DA VENDA
-- ==========================================

CREATE TABLE item_venda (
    id_item_venda INT IDENTITY(1,1) PRIMARY KEY,
    id_venda INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,

    subtotal AS (quantidade * preco_unitario) PERSISTED,

    CONSTRAINT fk_item_venda
        FOREIGN KEY (id_venda)
        REFERENCES venda(id_venda),

    CONSTRAINT fk_item_produto
        FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto),

    CONSTRAINT ck_item_quantidade
        CHECK (quantidade > 0),

    CONSTRAINT ck_item_preco
        CHECK (preco_unitario >= 0)
);

-- ==========================================
-- 8. MOVIMENTAÇÃO DE ESTOQUE
-- ==========================================

CREATE TABLE movimentacao_estoque (
    id_movimentacao INT IDENTITY(1,1) PRIMARY KEY,
    id_estoque INT NOT NULL,
    id_venda INT NULL,
    tipo VARCHAR(10) NOT NULL,
    quantidade INT NOT NULL,
    data_movimentacao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    motivo VARCHAR(150) NOT NULL,
    quantidade_anterior INT ,
    quantidade_posterior INT,

    CONSTRAINT fk_movimentacao_estoque
        FOREIGN KEY (id_estoque)
        REFERENCES estoque(id_estoque),

    CONSTRAINT fk_movimentacao_venda
        FOREIGN KEY (id_venda)
        REFERENCES venda(id_venda),

    CONSTRAINT ck_tipo_movimentacao
        CHECK (tipo IN ('entrada', 'saida', 'ajuste')),

    CONSTRAINT ck_quantidade_movimentacao
        CHECK (quantidade > 0)
);