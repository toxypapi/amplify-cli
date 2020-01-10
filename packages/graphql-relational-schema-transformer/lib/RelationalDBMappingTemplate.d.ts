import { ObjectNode, ListNode } from 'graphql-mapping-template';
/**
 * The class that contains the resolver templates for interacting
 * with the Relational Database data source.
 */
export declare class RelationalDBMappingTemplate {
    /**
     * Provided a SQL statement, creates the rds-query item resolver template.
     *
     * @param param0 - the SQL statement to use when querying the RDS cluster
     */
    static rdsQuery({ statements }: {
        statements: ListNode;
    }): ObjectNode;
}
