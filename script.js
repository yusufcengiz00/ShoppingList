// HTML elemanlarını seçiyoruz
const shoppingList = document.querySelector(".shopping-list");
const shoppingForm = document.querySelector(".shopping-form");
const filterButtons = document.querySelectorAll(".filter-buttons button");
const clearBtn = document.querySelector(".clear");

// Sayfa yüklendiğinde yapılacak işlemler
document.addEventListener("DOMContentLoaded", function() {
    loadItems();       // LocalStorage'dan ürünleri yükle
    updateState();     // Arayüz durumunu güncelle (boş mu dolu mu)
    shoppingForm.addEventListener("submit", handleFormSubmit);
    for (let button of filterButtons) {
        button.addEventListener("click", handleFilterSelection);
    }
    clearBtn.addEventListener("click", clear);
});

// Listeyi tamamen temizleme
function clear() {
    shoppingList.innerHTML = "";
    localStorage.removeItem("shoppingItems"); // sadece ilgili veriyi sil
    updateState();
}

// Boş liste durumunda arayüzü güncelle
function updateState() {
    const isEmpty = shoppingList.querySelectorAll("li").length === 0;
    const alert = document.querySelector(".alert");
    const filterBtns = document.querySelector(".filter-buttons");

    // Eleman yoksa uyarıyı göster, butonları gizle
    alert.classList.toggle("d-none", !isEmpty);
    clearBtn.classList.toggle("d-none", isEmpty);
    filterBtns.classList.toggle("d-none", isEmpty);
}

// Listeyi LocalStorage’a kaydet
function saveToLS() {
    const listItems = shoppingList.querySelectorAll("li");
    const List = [];

    for (let li of listItems) {
        const id = li.getAttribute("item-id");
        const name = li.querySelector(".item-name").textContent;
        const completed = li.hasAttribute("item-completed");
        List.push({ id, name, completed });
    }

    localStorage.setItem("shoppingItems", JSON.stringify(List));
}

// LocalStorage’daki verileri yükle
function loadItems() {
    const items = JSON.parse(localStorage.getItem("shoppingItems")) || [];
    shoppingList.innerHTML = "";
    for (let item of items) {
        const li = createListItem(item);
        shoppingList.appendChild(li);
    }
}

// Yeni ürün ekleme
function addItem(input) {
    const newItem = createListItem({
        id: generateId(),
        name: input.value,
        completed: false
    });

    shoppingList.appendChild(newItem);
    input.value = "";
    updateFilterItems();
    saveToLS();
    updateState();
}

// Benzersiz ID üretme
function generateId() {
    return Date.now().toString();
}

// Form gönderildiğinde çalışan fonksiyon
function handleFormSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("item_name");

    if (input.value.trim().length === 0) {
        alert("Lütfen Bir Ürün Ekleyiniz!");
        return;
    }

    addItem(input);
}

// Ürün tamamlandı mı tıklanınca işaretle
function toggleCompleted(e) {
    const li = e.target.parentElement;
    li.toggleAttribute("item-completed", e.target.checked);
    updateFilterItems();
    saveToLS();
}

// Ürünü sil
function removeItem(e) {
    const li = e.target.parentElement;
    shoppingList.removeChild(li);
    saveToLS();
    updateState();
}

// Ürünü düzenleme (üzerine tıklayınca)
function openEditMode(e) {
    const li = e.target.parentElement;
    if (!li.hasAttribute("item-completed")) {
        e.target.contentEditable = true;
    }
}

// Düzenlemeyi bitirince kaydet
function closeEditMode(e) {
    e.target.contentEditable = false;
    saveToLS();
}

// Enter tuşuna basınca düzenlemeyi kapat
function cancelEnter(e) {
    if (e.key == "Enter") {
        e.preventDefault();
        closeEditMode(e);
    }
}

// Filtre seçildiğinde aktif butonu güncelle
function handleFilterSelection(e) {
    const filterBtn = e.target;
    for (let button of filterButtons) {
        button.classList.add("btn-secondary");
        button.classList.remove("btn-primary");
    }
    filterBtn.classList.add("btn-primary");
    filterBtn.classList.remove("btn-secondary");
    filterItems(filterBtn.getAttribute("item-filter"));
}

// Filtreleme işlemi
function filterItems(filterType) {
    const li_items = shoppingList.querySelectorAll("li");

    for (let li of li_items) {
        li.classList.remove("d-flex", "d-none");
        const completed = li.hasAttribute("item-completed");

        if (filterType == "completed") {
            li.classList.toggle("d-flex", completed);
            li.classList.toggle("d-none", !completed);
        } else if (filterType == "incompleted") {
            li.classList.toggle("d-flex", !completed);
            li.classList.toggle("d-none", completed);
        } else {
            li.classList.add("d-flex");
        }
    }
}

// Aktif filtreye göre görünümü güncelle
function updateFilterItems() {
    const activeFilter = document.querySelector(".btn-primary[item-filter]");
    filterItems(activeFilter.getAttribute("item-filter"));
}

// Yeni liste elemanı oluşturma fonksiyonu
function createListItem(item) {
    // Checkbox
    const input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add("form-check-input");
    input.checked = item.completed;
    input.addEventListener("change", toggleCompleted);

    // Ürün adı (düzenlenebilir)
    const div = document.createElement("div");
    div.textContent = item.name;
    div.classList.add("item-name");
    div.addEventListener("click", openEditMode);
    div.addEventListener("blur", closeEditMode);
    div.addEventListener("keydown", cancelEnter);

    // Silme ikonu
    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fs-3 bi bi-x text-danger delete-icon";
    deleteIcon.addEventListener("click", removeItem);

    // Liste elemanı
    const li = document.createElement("li");
    li.setAttribute("item-id", item.id);
    li.className = "border rounded p-2 mb-1";
    li.toggleAttribute("item-completed", item.completed);

    li.appendChild(input);
    li.appendChild(div);
    li.appendChild(deleteIcon);

    return li;
}
