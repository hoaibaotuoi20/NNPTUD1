async function getData() {
  try {
    let res = await fetch("http://localhost:3000/posts");
    let posts = await res.json();
    let body = document.getElementById("table_body");
    body.innerHTML = "";
    for (const post of posts) {
      // Kiểm tra nếu post đã bị xoá mềm thì thêm style gạch ngang
      let style = post.isDeleted
        ? "text-decoration: line-through; color: gray;"
        : "";
      let deleteBtn = post.isDeleted
        ? ""
        : `<input type='submit' value='Delete' onclick='Delete(${post.id})'>`;
      body.innerHTML += `<tr style="${style}">
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>${deleteBtn}</td>
            </tr>`;
    }
  } catch (error) {
    console.log(error);
  }
}

// Hàm lấy maxId từ danh sách posts
async function getMaxId() {
  let res = await fetch("http://localhost:3000/posts");
  let posts = await res.json();
  let maxId = 0;
  for (const post of posts) {
    let postId = parseInt(post.id);
    if (postId > maxId) {
      maxId = postId;
    }
  }
  return maxId;
}

async function Save() {
  let id = document.getElementById("txt_id").value;
  let title = document.getElementById("txt_title").value;
  let views = document.getElementById("txt_views").value;

  if (id) {
    // Nếu có ID thì kiểm tra để edit
    let getItem = await fetch("http://localhost:3000/posts/" + id);
    if (getItem.ok) {
      //edit
      let res = await fetch("http://localhost:3000/posts/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          views: views,
        }),
      });
      if (res.ok) {
        console.log("cap nhat thanh cong");
        getData();
      }
    }
  } else {
    // Nếu không có ID thì tạo mới với ID = maxId + 1
    let newId = (await getMaxId()) + 1;
    let res = await fetch("http://localhost:3000/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: String(newId),
        title: title,
        views: views,
        isDeleted: false,
      }),
    });
    if (res.ok) {
      console.log("tao moi thanh cong");
      getData();
      // Reset form
      document.getElementById("txt_id").value = "";
      document.getElementById("txt_title").value = "";
      document.getElementById("txt_views").value = "";
    }
  }
}

// Xoá mềm: thay vì xoá thực sự, cập nhật isDeleted = true
async function Delete(id) {
  let res = await fetch("http://localhost:3000/posts/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      isDeleted: true,
    }),
  });
  if (res.ok) {
    console.log("xoa mem thanh cong");
    getData();
  }
}

getData();
