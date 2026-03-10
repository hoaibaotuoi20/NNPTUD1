const http = require('http');

const API_BASE = 'http://localhost:3000';

const request = (method, path, data = null) => {
    return new Promise((resolve, reject) => {
        const url = new URL(`${API_BASE}${path}`);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
};

async function runTests() {
    console.log('--- BẮT ĐẦU TEST ---');

    // 1. Tạo Role
    console.log('\n[1] Tạo Role mới...');
    const roleRes = await request('POST', '/roles', {
        name: `Admin_${Date.now()}`,
        description: 'Administrator Role'
    });
    console.log('Status:', roleRes.status);
    console.log('Response:', roleRes.data);
    const roleId = roleRes.data._id;

    // 2. Tạo User 1
    console.log('\n[2] Tạo User 1 (thuộc Role vừa tạo)...');
    const timestamp1 = Date.now();
    const user1Res = await request('POST', '/users', {
        username: `nguyenvana_${timestamp1}`,
        password: 'password123',
        email: `vana_${timestamp1}@gmail.com`,
        fullName: 'Nguyễn Văn A',
        role: roleId
    });
    console.log('Status:', user1Res.status);
    console.log('Response:', user1Res.data);
    const user1Id = user1Res.data._id;

    // 3. Tạo User 2
    console.log('\n[3] Tạo User 2 (thuộc Role vừa tạo)...');
    const timestamp2 = Date.now() + 1;
    const user2Res = await request('POST', '/users', {
        username: `tranthib_${timestamp2}`,
        password: 'password456',
        email: `thib_${timestamp2}@gmail.com`,
        fullName: 'Trần Thị B',
        role: roleId
    });
    console.log('Status:', user2Res.status);
    const user2Id = user2Res.data._id;

    // 4. Lấy tất cả User (bao gồm query username)
    console.log('\n[4] Test API Get All Users với ?username=nguyen...');
    const queryRes = await request('GET', '/users?username=nguyen');
    console.log('Status:', queryRes.status);
    console.log(`Tìm thấy ${queryRes.data.length} user có chữ "nguyen" trong username`);

    // 5. Test Lấy User theo roleId
    console.log(`\n[5] Test Get Users by Role ID (/roles/${roleId}/users)...`);
    const roleUsersRes = await request('GET', `/roles/${roleId}/users`);
    console.log('Status:', roleUsersRes.status);
    console.log(`Tìm thấy ${roleUsersRes.data.length} user thuộc Role này.`);

    // 6. Test Enable User
    console.log(`\n[6] Test POST /enable cho User 1...`);
    const enableRes = await request('POST', '/enable', {
        email: user1Res.data.email,
        username: user1Res.data.username
    });
    console.log('Status:', enableRes.status);
    console.log('Current status:', enableRes.data.user.status);

    // 7. Test Disable User
    console.log(`\n[7] Test POST /disable cho User 1...`);
    const disableRes = await request('POST', '/disable', {
        email: user1Res.data.email,
        username: user1Res.data.username
    });
    console.log('Status:', disableRes.status);
    console.log('Current status:', disableRes.data.user.status);

    // 8. Test Xóa Mềm User 2
    console.log(`\n[8] Test Xóa Mềm (Soft Delete) User 2...`);
    const deleteUserRes = await request('DELETE', `/users/${user2Id}`);
    console.log('Status:', deleteUserRes.status);
    console.log('Current isDeleted:', deleteUserRes.data.user.isDeleted);

    // 9. Kiểm tra lại Get All Users xem User 2 đã biến mất chưa
    console.log('\n[9] Lấy tất cả user (kiểm tra xóa mềm)...');
    const allUsersRes = await request('GET', '/users');
    const isDeletedUserAvailable = allUsersRes.data.some(u => u._id === user2Id);
    console.log(`User 2 có bị lẫn trong danh sách lấy ra không? ->`, isDeletedUserAvailable);

    // 10. Test Xóa Mềm Role
    console.log(`\n[10] Test Xóa Mềm (Soft Delete) Role...`);
    const deleteRoleRes = await request('DELETE', `/roles/${roleId}`);
    console.log('Status:', deleteRoleRes.status);
    console.log('Current isDeleted:', deleteRoleRes.data.role.isDeleted);

    console.log('\n--- KẾT THÚC TEST ---');
}

runTests().catch(console.error);
