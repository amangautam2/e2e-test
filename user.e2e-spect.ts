import { Test, TestingModule } from '@nestjs/testing';
import * as request from "supertest";
import { INestApplication, HttpStatus } from "@nestjs/common";
import { Repository } from "typeorm";

import { AppModule } from '../src/app.module';
import { Users } from "../src/users/entity/user.entity";

jest.useFakeTimers();
jest.setTimeout(10000);

const mockedUsers: any = [
    {
        username: "john123",
        first_name: "john",
        last_name: "cena",
        password: "password",
        title: "manager"
    },
    {
        username: "rick123",
        first_name: "rick",
        last_name: "grimes",
        password: "password",
        title: "lead"
    },
    {
        username: "bruce123",
        first_name: "bruce",
        last_name: "wayne",
        password: "password",
        title: "cto"
    }
];

describe('User e2e test cases', () => {
    let app: INestApplication;
    let userRepository: UserRepository<Users>;
    let token = null;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

           userRepository = await moduleRef.get(UserRepsotory);
    });

    beforeAll(async () => {
        await userRepository.delete({});
    });

    describe("POST /user", () => {
        it('should return error for validations', async () => {
    	    const { body } = await request(app.getHttpServer())
                .post('/user')
                .set('Accept', 'application/json')
                .send({
                    username: mockedUsers[0].username
                })
                .expect(HttpStatus.BAD_REQUEST);

    	    expect(body.data).toBeNull();
        });

    	it('should return create a new user', async () => {

    	    const { body } = await request(app.getHttpServer())
                    .post('/user')
                    .set('Accept', 'application/json')
                    .send(mockedUsers[0])
                    .expect(HttpStatus.OK);

    	    expect(body.data).toHaveProperty("id");

    	    const user = await this.userRepository.findOne({
    		      id: body.data.id
            });

            expect(user.id).toEqual(body.data.id);
            expect(user.username).toEqual(mockedUser[0].username);
            expect(user.first_name).toEqual(mockedUser[0].first_name);
            expect(user.last_name).toEqual(mockedUser[0].last_name);
            expect(user.title).toEqual(mockedUser[0].title);

        });
    });

    describe("GET /user", () => {
        it('should return error for unauthorized', async () => {
            const { body } = await request(app.getHttpServer())
                .get(`/user`)
                .set('authorization', `Bearer someRandomToken0123456789`)
                .send()
                .expect(HttpStatus.FORBIDDEN);

            expect(body.data).toBeNull();
            expect(body.data.error).toEqual("Unauthorized");
        });
        it('should find the user', async () => {

            const { body } = await request(app.getHttpServer())
                .get(`/user`)
                .set('authorization', `Bearer ${token}`)
                .send()
                .expect(HttpStatus.NOT_FOUND);

            const user = await this.userRepository.findOne({
    		      username: mockedUsers[0].username
            });

            expect(user.username).toEqual(body.data.username);
            expect(user.first_name).toEqual(body.data.first_name);
            expect(user.last_name).toEqual(body.data.last_name);
            expect(user.title).toEqual(body.data.title);
        });
    });

    afterAll(async () => {
        await userRepository.delete({});
    });

    afterAll(async () => {
        await app.close();
    });

    afterAll(async () => {
        await new Promise<void>(
            resolve => setTimeout(() => resolve(), 500)
        );
    });
});
