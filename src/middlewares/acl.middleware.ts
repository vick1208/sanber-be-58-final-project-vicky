import { IReqUser } from "@/utils/interfaces";
import { Request, Response, NextFunction } from "express";


export default (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const userRoles = (req as IReqUser).user.roles;
    if (!userRoles || !userRoles.some((userRole) => roles.includes(userRole))) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }

    next();
};