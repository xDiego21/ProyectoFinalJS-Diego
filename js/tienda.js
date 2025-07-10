const DOLAR_OFICIAL = 1200;

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let usuario = JSON.parse(localStorage.getItem("usuario")) || null;

// Libreria
const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const formRegistro = document.getElementById("formRegistro");
const usuarioLogueado = document.getElementById("usuario-logueado");
const comprarBton = document.getElementById("comprar");
const vaciarCarritoBton = document.getElementById("vaciar-carrito");
const cerrarSesionBton = document.getElementById("cerrar-sesion");
const volverArribaBton = document.getElementById("volverArribaBton");

// Mostrar nombre del usuario si esta logueado
const mostrarUsuario = () => {
    if (usuario) {
        usuarioLogueado.textContent = `Usuario: ${usuario.usuario}`;
        console.log(`Usuario logueado: ${usuario.usuario}`);
    } else {
        usuarioLogueado.textContent = "No hay sesión activa.";
        console.log("Sesión no iniciada.");
    };
};

// Mostrar productos por seccion
const obtenerProductosPorSeccion = () => {
    const secciones = {
        PC: [],
        PS5: [],
        Nintendo: [],
    };
    function procesarSeccion(idSeccion, arrayDestino) {
        const contenedor = document.getElementById(idSeccion);
        if (!contenedor) return;

        const cartas = contenedor.querySelectorAll(".card");

        cartas.forEach(card => {
            const nombre = card.querySelector("h3").textContent.trim();
            const genero = card.querySelector(".list-group-item").textContent.replace("Genero: ", "").trim();
            const precioTexto = card.querySelectorAll(".list-group-item")[1].textContent.replace("Precio: ", "").trim();
            const enDolares = precioTexto.includes("USD");
            const precio = parseFloat(precioTexto.replace("USD$", "").replace("$", "").replace(",", "."));

            arrayDestino.push({
                nombre,
                genero,
                precio: enDolares ? `${precio} USD` : `$${precio}`,
                plataforma: idSeccion
            });
        });
    };
    procesarSeccion("pc", secciones.PC);
    procesarSeccion("ps5", secciones.PS5);
    procesarSeccion("nswitch", secciones.Nintendo);
    console.log("Productos por sección:");
    console.log("PC:", secciones.PC);
    console.log("PS5:", secciones.PS5);
    console.log("Nintendo Switch:", secciones.Nintendo);
};

// Actualiza el carrito en pantalla
const mostrarCarrito = () => {
    listaCarrito.innerHTML = "";
    let total = 0;

    carrito.forEach((producto, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${producto.nombre} - $${producto.precio.toLocaleString()}
            <button data-index="${index}" class="eliminar-item">❌</button>
        `;
        listaCarrito.appendChild(li);
        total += producto.precio;
    });

    totalCarrito.textContent = `Total: $${total.toLocaleString()}`;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    console.log("Carrito actualizado:", carrito);
    console.log(`Total: $${total}`);
};

// Agrega un producto al carrito
const agregarAlCarrito = (nombre, precio, enDolares = false) => {
    let precioFinal = enDolares ? precio * DOLAR_OFICIAL : precio;
    carrito.push({ nombre, precio: precioFinal });
    console.log(`Producto agregado: ${nombre} - $${precioFinal} (${enDolares ? "USD convertido" : "ARS"})`);
    mostrarCarrito();
    Toast.fire({
        icon: "success",
        title: `${nombre} agregado al carrito`
    });
};

// Click
document.addEventListener("click", function (e) {
    // Añadir al carrito
    if (e.target.tagName === "BUTTON" && e.target.hasAttribute("data-nombre")) {
        e.preventDefault();
        const nombre = e.target.getAttribute("data-nombre");
        const precioTexto = e.target.getAttribute("data-precio");
        const enDolares = e.target.classList.contains("botonUsd");
        const precio = parseFloat(precioTexto.replace(",", "").replace(".", "."));
        agregarAlCarrito(nombre, precio, enDolares);
    }

    // Eliminar producto del carrito
    if (e.target.classList.contains("eliminar-item")) {
        const index = e.target.getAttribute("data-index");
        const eliminado = carrito.splice(index, 1);
        mostrarCarrito();
        if (eliminado[0]) {
            Toast.fire({
                icon: "warning",
                title: `"${eliminado[0].nombre}" fue eliminado del carrito`
            });
            console.log(`Producto eliminado del carrito:`, eliminado[0]);
        }
    }
});

// Formulario de registro
formRegistro.addEventListener("submit", function (e) {
    e.preventDefault();
    const nuevoUsuario = document.getElementById("nuevoUsuario").value;
    const nuevaContraseña = document.getElementById("nuevaContraseña").value;
    const nuevoEmail = document.getElementById("nuevoEmail").value;

    usuario = { usuario: nuevoUsuario, contraseña: nuevaContraseña, email: nuevoEmail };
    localStorage.setItem("usuario", JSON.stringify(usuario));
    Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: `Bienvenido ${nuevoUsuario}!`,
        confirmButtonText: "Gracias"
    });
    console.log("Usuario registrado:", usuario);
    formRegistro.reset();
    mostrarUsuario();
});

// Comprar
comprarBton.addEventListener("click", () => {
    if (!usuario) {
        Swal.fire({
            icon: "warning",
            title: "¡Atencion!",
            text: "Debes iniciar sesión para finalizar la compra.",
            confirmButtonText: "Entendido"
        });
        console.warn("Intento de compra sin usuario.");
        return;
    }
    if (carrito.length === 0) {
        Swal.fire({
            icon: "info",
            title: "Carrito vacio",
            text: "Agrega al menos un producto antes de comprar.",
            confirmButtonText: "OK"
});
        console.warn("Intento de compra con carrito vacío.");
        return;
    }
    console.log(`Compra realizada por ${usuario.usuario}. Total: $${carrito.reduce((acc, p) => acc + p.precio, 0)}`);
    carrito = [];
    mostrarCarrito();
    Swal.fire({
        icon: "success",
        title: "¡Compra realizada!",
        text: `Gracias por tu compra, ${usuario.usuario}!`,
        confirmButtonText: "De nada"
    });
});

// Vaciar carrito
vaciarCarritoBton.addEventListener("click", () => {
    if (carrito.length === 0) {
        Toast.fire({
            icon: "info",
            title: "El carrito ya está vacío"
        });
        return;
    }
    carrito = [];
    mostrarCarrito();
    Toast.fire({
        icon: "info",
        title: "Carrito vacío."
    });
    console.log("Carrito vaciado.");
});

// Cerrar sesion
cerrarSesionBton.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    usuario = null;
    mostrarUsuario();
    Toast.fire({
        icon: "success",
        title: "Sesion cerrada con exito"
    });
    console.log("Usuario cerró sesión.");
});

// Carga inicial
window.addEventListener("DOMContentLoaded", () => {
    if (!sessionStorage.getItem("bienvenidaMostrada")) {
        Swal.fire({
            icon: "info",
            title: "¡Bienvenido!",
            text: "Tu Tienda de Juegos te da la bienvenida",
            confirmButtonText: "Aceptar"
        }).then(() => {
        console.log("Mensaje de bienvenida mostrado.");
        sessionStorage.setItem("bienvenidaMostrada", "true");
        });
    }
    obtenerProductosPorSeccion();
    mostrarCarrito();
    mostrarUsuario();
});

// Filtro de busqueda
function configurarFiltrosPorSeccion() {
    const secciones = document.querySelectorAll(".tab-pane");

    secciones.forEach(seccion => {
        const buscador = seccion.querySelector(".buscador");
        const filtroGenero = seccion.querySelector(".filtro-genero");
        const cartas = seccion.querySelectorAll(".card");
        if (buscador && filtroGenero) {
            const filtrar = () => {
                const texto = buscador.value.toLowerCase();
                const genero = filtroGenero.value;
                cartas.forEach(card => {
                    const nombre = card.getAttribute("data-nombre").toLowerCase();
                    const generoCard = card.getAttribute("data-genero");
                    const coincideNombre = nombre.includes(texto);
                    const coincideGenero = genero === "" || generoCard.includes(genero);
                    card.style.display = (coincideNombre && coincideGenero) ? "block" : "none";
                });
            };
            buscador.addEventListener("input", filtrar);
            filtroGenero.addEventListener("change", filtrar);
        }
    });
}

document.addEventListener("DOMContentLoaded", configurarFiltrosPorSeccion);

// Boton fijo
window.addEventListener("scroll", () => {
    volverArribaBton.style.display = window.scrollY > 300 ? "flex" : "none";
});

volverArribaBton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});